using DashyDashboard.Api.Data;
using DashyDashboard.Api.Models.Domain;
using DashyDashboard.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DashyDashboard.Api.Services;

public class ManagerService
{
    private readonly AppDbContext _db;
    public ManagerService(AppDbContext db) { _db = db; }

    public async Task<TeamDto> GetTeamAsync(string managerId, int cycleId)
    {
        var today = DateTime.Today.ToString("yyyy-MM-dd");

        var reports = await _db.Users.AsNoTracking()
            .Where(u => u.ManagerId == managerId)
            .ToListAsync();

        var userIds = reports.Select(u => u.AssociateId).ToList();

        var toolCounts = await _db.UserToolAccess.AsNoTracking()
            .Where(uta => userIds.Contains(uta.AssociateId)
                       && !string.IsNullOrEmpty(uta.FromDate)
                       && (string.IsNullOrEmpty(uta.ToDate) || uta.ToDate.CompareTo(today) >= 0))
            .GroupBy(uta => uta.AssociateId)
            .Select(g => new { AssociateId = g.Key, Count = g.Count() })
            .ToListAsync();

        var attestCounts = await _db.ToolCycleAttestations.AsNoTracking()
            .Where(tca => userIds.Contains(tca.AssociateId)
                       && tca.CycleID == cycleId
                       && tca.UsedThisCycle.HasValue)
            .GroupBy(tca => tca.AssociateId)
            .Select(g => new { AssociateId = g.Key, Count = g.Count() })
            .ToListAsync();

        var members = reports.Select(u =>
        {
            var total = toolCounts.FirstOrDefault(t => t.AssociateId == u.AssociateId)?.Count ?? 0;
            var attested = attestCounts.FirstOrDefault(a => a.AssociateId == u.AssociateId)?.Count ?? 0;
            var pct = total > 0 ? (double)attested / total : 0;
            var status = pct >= 1 ? "Submitted" : attested == 0 ? "NotStarted" : "InProgress";
            return new TeamMemberDto(u.AssociateId, $"{u.FirstName} {u.LastName}", status, total, attested, Math.Round(pct, 4));
        }).ToList();

        return new TeamDto(
            members.Count,
            members.Sum(m => m.TotalTools),
            members.Sum(m => m.AttestedTools),
            members.Count(m => m.AttestationStatus == "Submitted"),
            members.Count(m => m.AttestationStatus == "InProgress"),
            members.Count(m => m.AttestationStatus == "NotStarted"),
            members);
    }

    public async Task<MemberDetailDto?> GetMemberDetailAsync(string managerId, string memberId, int cycleId)
    {
        var today = DateTime.Today.ToString("yyyy-MM-dd");

        var member = await _db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.AssociateId == memberId && u.ManagerId == managerId);

        if (member is null) return null;

        var accessWithTools = await _db.UserToolAccess.AsNoTracking()
            .Where(uta => uta.AssociateId == memberId
                       && !string.IsNullOrEmpty(uta.FromDate)
                       && (string.IsNullOrEmpty(uta.ToDate) || uta.ToDate.CompareTo(today) >= 0))
            .Join(_db.ClientTools.AsNoTracking(),
                uta => new { uta.ClientID, AppName = uta.ApplicationName },
                ct => new { ct.ClientID, AppName = ct.ToolName },
                (uta, ct) => new { uta.ClientID, ct.ToolID })
            .ToListAsync();

        var clientNames = await _db.Clients.AsNoTracking()
            .Where(c => accessWithTools.Select(a => a.ClientID).Distinct().Contains(c.ClientID))
            .ToDictionaryAsync(c => c.ClientID, c => c.ClientName ?? c.ClientID);

        var attestations = await _db.ToolCycleAttestations.AsNoTracking()
            .Where(tca => tca.AssociateId == memberId && tca.CycleID == cycleId && tca.UsedThisCycle.HasValue)
            .ToListAsync();

        var byClient = accessWithTools
            .GroupBy(a => a.ClientID)
            .Select(g =>
            {
                var total = g.Count();
                var attested = attestations.Count(a => a.ClientID == g.Key);
                return new ClientProgressDto(g.Key, clientNames.GetValueOrDefault(g.Key, g.Key), total, attested);
            })
            .OrderBy(c => c.ClientName)
            .ToList();

        var totalTools = byClient.Sum(c => c.TotalTools);
        var totalAttested = byClient.Sum(c => c.AttestedTools);
        var pct = totalTools > 0 ? (double)totalAttested / totalTools : 0;
        var status = pct >= 1 ? "Submitted" : totalAttested == 0 ? "NotStarted" : "InProgress";

        return new MemberDetailDto(member.AssociateId, $"{member.FirstName} {member.LastName}",
                                   status, totalTools, totalAttested, Math.Round(pct, 4), byClient);
    }

    public async Task<List<UserListItem>> GetAllUsersAsync()
    {
        var users = await _db.Users.AsNoTracking()
            .Include(u => u.Manager)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync();

        return users.Select(u => new UserListItem(
            u.AssociateId,
            u.FirstName,
            u.LastName,
            $"{u.FirstName} {u.LastName}".Trim(),
            u.UserName,
            u.Department,
            u.ManagerId,
            u.Manager != null ? $"{u.Manager.FirstName} {u.Manager.LastName}".Trim() : null
        )).ToList();
    }

    private async Task AssertReportsToAsync(string managerId, string memberId)
    {
        var reports = await _db.Users.AnyAsync(u => u.AssociateId == memberId && u.ManagerId == managerId);
        if (!reports)
            throw new UnauthorizedAccessException("This associate does not report to you.");
    }

    public async Task GrantAccessAsync(string managerId, string memberId, GrantAccessRequest req)
    {
        await AssertReportsToAsync(managerId, memberId);

        var tool = await _db.ClientTools
            .FirstOrDefaultAsync(ct => ct.ClientID == req.ClientID && ct.ToolID == req.ToolID);
        if (tool is null)
            throw new KeyNotFoundException($"Tool {req.ToolID} for client {req.ClientID} not found.");

        var today = DateOnly.FromDateTime(DateTime.Today);
        var accessFrom = req.AccessFrom ?? today;

        if (req.AccessTo is not null && req.AccessTo < accessFrom)
            throw new InvalidOperationException("End date cannot be before the start date.");

        var accessFromStr = accessFrom.ToString("yyyy-MM-dd");
        var accessToStr = req.AccessTo?.ToString("yyyy-MM-dd");

        var existing = await _db.UserToolAccess
            .FirstOrDefaultAsync(uta => uta.AssociateId == memberId
                                     && uta.ClientID == req.ClientID
                                     && uta.ApplicationName == tool.ToolName);

        if (existing is null)
        {
            _db.UserToolAccess.Add(new UserToolAccess
            {
                AssociateId = memberId,
                ClientID = req.ClientID,
                ApplicationName = tool.ToolName,
                Access = "TRUE",
                FromDate = accessFromStr,
                ToDate = accessToStr,
            });
        }
        else
        {
            existing.Access = "TRUE";
            existing.FromDate = accessFromStr;
            existing.ToDate = accessToStr;
        }

        await _db.SaveChangesAsync();
    }

    public async Task UpdateAccessEndDateAsync(string managerId, string memberId, string clientId, int toolId, DateOnly? accessTo)
    {
        await AssertReportsToAsync(managerId, memberId);

        var tool = await _db.ClientTools.AsNoTracking()
            .FirstOrDefaultAsync(ct => ct.ToolID == toolId && ct.ClientID == clientId);
        if (tool is null)
            throw new KeyNotFoundException("Tool not found.");

        var today = DateTime.Today.ToString("yyyy-MM-dd");
        var access = await _db.UserToolAccess
            .Where(uta => uta.AssociateId == memberId
                       && uta.ClientID == clientId
                       && uta.ApplicationName == tool.ToolName
                       && (string.IsNullOrEmpty(uta.ToDate) || uta.ToDate.CompareTo(today) >= 0))
            .OrderByDescending(uta => uta.FromDate)
            .FirstOrDefaultAsync();

        if (access is null)
            throw new KeyNotFoundException("No active access found for this tool.");

        if (accessTo is not null && !string.IsNullOrEmpty(access.FromDate)
            && accessTo.Value < DateOnly.Parse(access.FromDate))
            throw new InvalidOperationException("End date cannot be before the start date.");

        access.ToDate = accessTo?.ToString("yyyy-MM-dd");
        await _db.SaveChangesAsync();
    }

    public async Task RevokeAccessAsync(string managerId, string memberId, string clientId, int toolId)
    {
        await AssertReportsToAsync(managerId, memberId);

        var tool = await _db.ClientTools.AsNoTracking()
            .FirstOrDefaultAsync(ct => ct.ToolID == toolId && ct.ClientID == clientId);
        if (tool is null)
            throw new KeyNotFoundException("Tool not found.");

        var today = DateTime.Today.ToString("yyyy-MM-dd");
        var access = await _db.UserToolAccess
            .Where(uta => uta.AssociateId == memberId
                       && uta.ClientID == clientId
                       && uta.ApplicationName == tool.ToolName
                       && (string.IsNullOrEmpty(uta.ToDate) || uta.ToDate.CompareTo(today) >= 0))
            .OrderByDescending(uta => uta.FromDate)
            .FirstOrDefaultAsync();

        if (access is null)
            throw new KeyNotFoundException("No active access found for this tool.");

        var fromDate = !string.IsNullOrEmpty(access.FromDate) ? access.FromDate : today;
        access.ToDate = today.CompareTo(fromDate) < 0 ? fromDate : today;
        await _db.SaveChangesAsync();
    }

    public async Task<List<MemberAccessDto>> GetMemberAccessAsync(string managerId, string memberId)
    {
        await AssertReportsToAsync(managerId, memberId);

        var today = DateTime.Today.ToString("yyyy-MM-dd");
        var accessWithTools = await _db.UserToolAccess.AsNoTracking()
            .Where(uta => uta.AssociateId == memberId
                       && (string.IsNullOrEmpty(uta.ToDate) || uta.ToDate.CompareTo(today) >= 0))
            .Join(_db.ClientTools.AsNoTracking(),
                uta => new { uta.ClientID, AppName = uta.ApplicationName },
                ct => new { ct.ClientID, AppName = ct.ToolName },
                (uta, ct) => new {
                    uta.ClientID,
                    ct.ToolID,
                    ct.ToolName,
                    uta.FromDate,
                    uta.ToDate
                })
            .ToListAsync();

        var clientNames = await _db.Clients.AsNoTracking()
            .Where(c => accessWithTools.Select(a => a.ClientID).Distinct().Contains(c.ClientID))
            .ToDictionaryAsync(c => c.ClientID, c => c.ClientName ?? c.ClientID);

        return accessWithTools
            .GroupBy(a => a.ClientID)
            .Select(g => new MemberAccessDto(
                g.Key,
                clientNames.GetValueOrDefault(g.Key, g.Key),
                g.OrderBy(a => a.ToolName)
                 .Select(a => new AccessRowDto(a.ToolID, a.ToolName, a.FromDate ?? "", a.ToDate))
                 .ToList()))
            .OrderBy(c => c.ClientName)
            .ToList();
    }

    public async Task<List<ClientAttestationDto>> GetClientsAndToolsAsync()
    {
        var clients = await _db.Clients.AsNoTracking()
            .Include(c => c.Tools)
            .OrderBy(c => c.ClientName)
            .ToListAsync();

        return clients.Select(c => new ClientAttestationDto(
            c.ClientID, c.ClientName ?? c.ClientID,
            c.Tools.Count, 0, 0,
            c.Tools.Select(t => new ToolAttestationDto(t.ToolID, t.ToolName, null, "N/A", null)).ToList()
        )).ToList();
    }

    public async Task<CycleDto> GenerateNextCycleAsync(string actorAssociateId)
    {
        var latest = await _db.Cycles.AsNoTracking()
            .OrderByDescending(c => c.EndDate)
            .FirstOrDefaultAsync();

        DateOnly nextStart;
        if (latest is null)
        {
            var now = DateTime.Today;
            nextStart = new DateOnly(now.Year, now.Month, 1);
        }
        else
        {
            nextStart = latest.EndDate.AddDays(1);
        }

        var daysInMonth = DateTime.DaysInMonth(nextStart.Year, nextStart.Month);
        var nextEnd = new DateOnly(nextStart.Year, nextStart.Month, daysInMonth);
        var cycleName = nextStart.ToString("MMMM yyyy");

        if (await _db.Cycles.AnyAsync(c => c.StartDate == nextStart))
            throw new InvalidOperationException($"Cycle for {cycleName} already exists.");

        var cycle = new Cycle
        {
            CycleName = cycleName,
            StartDate = nextStart,
            EndDate = nextEnd,
            DueDate = nextEnd
        };
        _db.Cycles.Add(cycle);
        await _db.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.Today);
        return new CycleDto(cycle.CycleID, cycle.CycleName, cycle.StartDate,
                            cycle.EndDate, cycle.DueDate,
                            cycle.DueDate.DayNumber - today.DayNumber);
    }
}
