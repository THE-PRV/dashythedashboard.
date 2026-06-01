using DashyDashboard.Api.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace DashyDashboard.Api.Data;

public static class SeedData
{
    public static async Task RunAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.SuperUsers.AnyAsync())
        {
            db.SuperUsers.AddRange(
                new SuperUser { AssociateId = "1001", RoleName = "Admin", Department = "DTC Settlements", AccessLevel = "Full", IsActive = "TRUE", CreatedOn = DateTime.UtcNow, CreatedBy = "system" },
                new SuperUser { AssociateId = "1002", RoleName = "GFH", Department = "Government Settlement", AccessLevel = "Dept", IsActive = "TRUE", CreatedOn = DateTime.UtcNow, CreatedBy = "system" },
                new SuperUser { AssociateId = "1003", RoleName = "IFH", Department = "Reorg", AccessLevel = "Dept", IsActive = "TRUE", CreatedOn = DateTime.UtcNow, CreatedBy = "system" }
            );
            await db.SaveChangesAsync();
        }

        if (await db.Users.AnyAsync()) return;

        var clients = new List<Client>
        {
            new Client { ClientID = "DTC-US", ClientName = "DTC", ClientDesc = "DTC US Settlements", CurrentState = "Active", Tier = "1" },
            new Client { ClientID = "DTC-UK", ClientName = "DTC", ClientDesc = "DTC UK Settlements", CurrentState = "Active", Tier = "1" },
            new Client { ClientID = "NATIXIS", ClientName = "Natixis", ClientDesc = "Natixis CIB", CurrentState = "Active", Tier = "2" },
            new Client { ClientID = "MAREX", ClientName = "Marex", ClientDesc = "Marex Spectron", CurrentState = "Active", Tier = "2" },
            new Client { ClientID = "BARCLAYS-US", ClientName = "Barclays", ClientDesc = "Barclays US", CurrentState = "Active", Tier = "1" },
        };
        db.Clients.AddRange(clients);
        await db.SaveChangesAsync();

        var toolDefs = new (string ClientID, string ToolName)[]
        {
            ("DTC-US", "Trade Capture"), ("DTC-US", "Settlement Gateway"), ("DTC-US", "Reconciliation Hub"), ("DTC-US", "Reporting Suite"),
            ("DTC-UK", "Trade Capture"), ("DTC-UK", "Settlement Gateway"), ("DTC-UK", "Compliance Portal"),
            ("NATIXIS", "Risk Engine"), ("NATIXIS", "Pricing Service"), ("NATIXIS", "Reporting Suite"), ("NATIXIS", "Compliance Portal"),
            ("MAREX", "Trade Capture"), ("MAREX", "Risk Engine"), ("MAREX", "Settlement Gateway"),
            ("BARCLAYS-US", "Risk Engine"), ("BARCLAYS-US", "Reconciliation Hub"), ("BARCLAYS-US", "Pricing Service"), ("BARCLAYS-US", "Compliance Portal"),
        };
        var clientTools = toolDefs.Select(t => new ClientTool { ClientID = t.ClientID, ToolName = t.ToolName }).ToList();
        db.ClientTools.AddRange(clientTools);
        await db.SaveChangesAsync();

        var mgr1 = new User { AssociateId = "1001", FirstName = "Diana", LastName = "Prince", UserName = "CORP\\dprince", Department = "DTC Settlements" };
        var mgr2 = new User { AssociateId = "1002", FirstName = "Bruce", LastName = "Banner", UserName = "CORP\\bbanner", Department = "Government Settlement" };
        var mgr3 = new User { AssociateId = "1003", FirstName = "Selina", LastName = "Kyle", UserName = "CORP\\skyle", Department = "Reorg" };
        db.Users.AddRange(mgr1, mgr2, mgr3);
        await db.SaveChangesAsync();

        var analysts = new List<User>
        {
            new User { AssociateId = "2001", FirstName = "Alice", LastName = "Chen", UserName = "CORP\\achen", ManagerId = "1001", Department = "DTC Settlements" },
            new User { AssociateId = "2002", FirstName = "Brandon", LastName = "Diaz", UserName = "CORP\\bdiaz", ManagerId = "1001", Department = "DTC Settlements" },
            new User { AssociateId = "2003", FirstName = "Cara", LastName = "Patel", UserName = "CORP\\cpatel", ManagerId = "1001", Department = "DTC Settlements" },
            new User { AssociateId = "2004", FirstName = "Derek", LastName = "Yamada", UserName = "CORP\\dyamada", ManagerId = "1001", Department = "DTC Settlements" },
            new User { AssociateId = "2005", FirstName = "Elena", LastName = "Ruiz", UserName = "CORP\\eruiz", ManagerId = "1002", Department = "Government Settlement" },
            new User { AssociateId = "2006", FirstName = "Faisal", LastName = "Khan", UserName = "CORP\\fkhan", ManagerId = "1002", Department = "Government Settlement" },
            new User { AssociateId = "2007", FirstName = "Grace", LastName = "Lin", UserName = "CORP\\glin", ManagerId = "1002", Department = "Government Settlement" },
            new User { AssociateId = "2008", FirstName = "Henry", LastName = "Okafor", UserName = "CORP\\hokafor", ManagerId = "1003", Department = "Reorg" },
            new User { AssociateId = "2009", FirstName = "Iris", LastName = "Tanaka", UserName = "CORP\\itanaka", ManagerId = "1003", Department = "Reorg" },
            new User { AssociateId = "2010", FirstName = "Julian", LastName = "Park", UserName = "CORP\\jpark", ManagerId = "1003", Department = "Reorg" },
        };
        db.Users.AddRange(analysts);
        await db.SaveChangesAsync();

        var playerMgr = new User { AssociateId = "2011", FirstName = "Morgan", LastName = "Drake", UserName = "CORP\\mdrake", ManagerId = "1001", Department = "International" };
        db.Users.Add(playerMgr);
        await db.SaveChangesAsync();

        var subReports = new List<User>
        {
            new User { AssociateId = "3001", FirstName = "Quinn", LastName = "Adams", UserName = "CORP\\qadams", ManagerId = "2011", Department = "International" },
            new User { AssociateId = "3002", FirstName = "Raj", LastName = "Mehta", UserName = "CORP\\rmehta", ManagerId = "2011", Department = "International" },
            new User { AssociateId = "3003", FirstName = "Sophie", LastName = "Laurent", UserName = "CORP\\slaurent", ManagerId = "2011", Department = "International" },
        };
        db.Users.AddRange(subReports);
        await db.SaveChangesAsync();

        var mappings = new List<IFHGFHMapping>
        {
            new IFHGFHMapping { Area = "DTC Settlements", IFH = "Selina Kyle", GFH = "Diana Prince" },
            new IFHGFHMapping { Area = "Government Settlement", IFH = "Selina Kyle", GFH = "Bruce Banner" },
            new IFHGFHMapping { Area = "Reorg", IFH = "Morgan Drake", GFH = "Selina Kyle" },
            new IFHGFHMapping { Area = "International", IFH = "Morgan Drake", GFH = "Bruce Banner" },
        };
        db.IFHGFHMappings.AddRange(mappings);
        await db.SaveChangesAsync();

        var accessFrom = "2026-01-01";
        var access = new List<UserToolAccess>();

        void AddAccess(string associateId, params (string ClientID, string ToolName)[] grants)
        {
            foreach (var (clientId, toolName) in grants)
            {
                access.Add(new UserToolAccess
                {
                    AssociateId = associateId,
                    ClientID = clientId,
                    ApplicationName = toolName,
                    Access = "TRUE",
                    FromDate = accessFrom,
                    ToDate = null,
                });
            }
        }

        AddAccess("2011",
            ("DTC-US", "Trade Capture"), ("DTC-US", "Settlement Gateway"), ("DTC-US", "Reconciliation Hub"),
            ("NATIXIS", "Risk Engine"), ("NATIXIS", "Pricing Service"),
            ("MAREX", "Trade Capture"), ("MAREX", "Settlement Gateway"));

        AddAccess("2001", ("DTC-US", "Trade Capture"), ("DTC-US", "Settlement Gateway"), ("NATIXIS", "Risk Engine"), ("NATIXIS", "Reporting Suite"));
        AddAccess("2002", ("DTC-US", "Trade Capture"), ("DTC-US", "Reconciliation Hub"), ("BARCLAYS-US", "Risk Engine"), ("BARCLAYS-US", "Reconciliation Hub"));
        AddAccess("2003", ("DTC-UK", "Trade Capture"), ("DTC-UK", "Compliance Portal"), ("MAREX", "Risk Engine"), ("MAREX", "Settlement Gateway"));
        AddAccess("2004", ("NATIXIS", "Risk Engine"), ("NATIXIS", "Pricing Service"), ("NATIXIS", "Compliance Portal"), ("DTC-US", "Reporting Suite"));

        AddAccess("2005", ("MAREX", "Trade Capture"), ("MAREX", "Risk Engine"), ("BARCLAYS-US", "Risk Engine"), ("BARCLAYS-US", "Compliance Portal"));
        AddAccess("2006", ("BARCLAYS-US", "Risk Engine"), ("BARCLAYS-US", "Reconciliation Hub"), ("BARCLAYS-US", "Pricing Service"), ("NATIXIS", "Reporting Suite"));
        AddAccess("2007", ("DTC-UK", "Trade Capture"), ("DTC-UK", "Settlement Gateway"), ("MAREX", "Settlement Gateway"), ("MAREX", "Risk Engine"));

        AddAccess("2008", ("DTC-US", "Trade Capture"), ("DTC-US", "Reporting Suite"), ("DTC-UK", "Compliance Portal"));
        AddAccess("2009", ("NATIXIS", "Risk Engine"), ("NATIXIS", "Compliance Portal"), ("BARCLAYS-US", "Pricing Service"), ("BARCLAYS-US", "Compliance Portal"));
        AddAccess("2010", ("BARCLAYS-US", "Risk Engine"), ("BARCLAYS-US", "Reconciliation Hub"), ("DTC-US", "Settlement Gateway"), ("MAREX", "Trade Capture"));

        AddAccess("3001", ("DTC-US", "Trade Capture"), ("DTC-US", "Reconciliation Hub"), ("MAREX", "Risk Engine"));
        AddAccess("3002", ("NATIXIS", "Risk Engine"), ("NATIXIS", "Pricing Service"), ("DTC-UK", "Trade Capture"), ("DTC-UK", "Settlement Gateway"));
        AddAccess("3003", ("BARCLAYS-US", "Reconciliation Hub"), ("BARCLAYS-US", "Compliance Portal"), ("MAREX", "Trade Capture"), ("MAREX", "Settlement Gateway"));

        db.UserToolAccess.AddRange(access);
        await db.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.Today);
        var cycleClosed = new Cycle { CycleName = "Q4 2025 Attestation", StartDate = new DateOnly(2025, 10, 1), EndDate = new DateOnly(2025, 12, 31), DueDate = new DateOnly(2026, 1, 15) };
        var cycleActive = new Cycle { CycleName = "Q1 2026 Attestation", StartDate = new DateOnly(2026, 1, 1), EndDate = new DateOnly(2026, 3, 31), DueDate = today.AddDays(14) };
        var cycleUpcoming = new Cycle { CycleName = "Q2 2026 Attestation", StartDate = new DateOnly(2026, 4, 1), EndDate = new DateOnly(2026, 6, 30), DueDate = today.AddDays(60) };
        db.Cycles.AddRange(cycleClosed, cycleActive, cycleUpcoming);
        await db.SaveChangesAsync();

        var toolMap = clientTools.ToDictionary(ct => (ct.ClientID, ct.ToolName), ct => ct.ToolID);
        var attestations = new List<ToolCycleAttestation>();
        var rng = new Random(42);

        foreach (var uta in access)
        {
            var toolId = toolMap.GetValueOrDefault((uta.ClientID, uta.ApplicationName));

            attestations.Add(new ToolCycleAttestation
            {
                CycleID = cycleClosed.CycleID, AssociateId = uta.AssociateId,
                ClientID = uta.ClientID, ToolID = toolId,
                UsedThisCycle = rng.NextDouble() < 0.75, AttestationStatus = "Submitted",
                SubmittedAt = DateTime.UtcNow.AddDays(-90 + rng.Next(0, 10)),
            });

            var roll = rng.NextDouble();
            if (roll < 0.30) { }
            else if (roll < 0.70)
            {
                attestations.Add(new ToolCycleAttestation
                {
                    CycleID = cycleActive.CycleID, AssociateId = uta.AssociateId,
                    ClientID = uta.ClientID, ToolID = toolId,
                    UsedThisCycle = rng.NextDouble() < 0.6, AttestationStatus = "InProgress",
                });
            }
            else
            {
                attestations.Add(new ToolCycleAttestation
                {
                    CycleID = cycleActive.CycleID, AssociateId = uta.AssociateId,
                    ClientID = uta.ClientID, ToolID = toolId,
                    UsedThisCycle = rng.NextDouble() < 0.6, AttestationStatus = "Submitted",
                    SubmittedAt = DateTime.UtcNow.AddDays(-rng.Next(1, 6)),
                });
            }
        }
        db.ToolCycleAttestations.AddRange(attestations);
        await db.SaveChangesAsync();

        var extraMgrData = new (string Id, string First, string Last, string ReportsTo, string Dept)[]
        {
            ("1004", "David", "Kumar", "1001", "DTC Settlements"),
            ("1005", "Emma", "Silva", "1001", "DTC Settlements"),
            ("1006", "Priya", "Johnson", "1002", "Government Settlement"),
            ("1007", "Hassan", "Smith", "1002", "Government Settlement"),
            ("1008", "James", "Garcia", "1003", "Reorg"),
            ("1009", "Nina", "Chen", "1003", "Reorg"),
            ("1010", "Carlos", "Patel", "2011", "International"),
            ("1011", "Amita", "Martinez", "2011", "International"),
        };
        var extraMgrs = extraMgrData.Select(m => new User
        {
            AssociateId = m.Id, FirstName = m.First, LastName = m.Last,
            UserName = $"CORP\\{m.First.ToLower()}.{m.Last.ToLower()}",
            ManagerId = m.ReportsTo, Department = m.Dept,
        }).ToList();
        db.Users.AddRange(extraMgrs);
        await db.SaveChangesAsync();

        var fNames = new[] { "Adam","Amy","Andrew","Angela","Benjamin","Betty","Brian","Barbara",
            "Charles","Carol","Christopher","Cynthia","Daniel","Deborah","David","Donna",
            "Edward","Elizabeth","Eric","Emily","Francis","Frances","George","Gloria",
            "Harold","Hannah","Henry","Helen","James","Jennifer","John","Jessica",
            "Liam","Layla","Marcus","Maya","Nathan","Nadia","Oscar","Olivia" };
        var lNames = new[] { "Anderson","Brown","Chen","Davis","Evans","Flores","Garcia","Green",
            "Harris","Hassan","Hernandez","Huang","Jackson","Johnson","Jones","Khan",
            "Kim","Kumar","Lee","Lewis","Lin","Lopez","Martinez","Miller",
            "Mitchell","Moore","Nguyen","Okafor","Patel","Perez","Peterson","Powell",
            "Singh","Scott","Taylor","Thomas","Turner","Walker","Wilson","Zhang" };

        var bulkMgrIds = new[] { "1001","1002","1003","2011","1004","1005","1006","1007","1008","1009","1010","1011" };
        var bulkMgrDept = new Dictionary<string, string>
        {
            ["1001"] = "DTC Settlements", ["1002"] = "Government Settlement", ["1003"] = "Reorg", ["2011"] = "International",
            ["1004"] = "DTC Settlements", ["1005"] = "DTC Settlements",
            ["1006"] = "Government Settlement", ["1007"] = "Government Settlement",
            ["1008"] = "Reorg", ["1009"] = "Reorg",
            ["1010"] = "International", ["1011"] = "International",
        };
        var toolsByDept = new Dictionary<string, (string C, string T)[]>
        {
            ["DTC Settlements"] = new[] { ("DTC-US", "Trade Capture"), ("DTC-US", "Settlement Gateway"), ("DTC-US", "Reconciliation Hub"), ("DTC-UK", "Trade Capture") },
            ["Government Settlement"] = new[] { ("BARCLAYS-US", "Risk Engine"), ("BARCLAYS-US", "Reconciliation Hub"), ("MAREX", "Trade Capture"), ("MAREX", "Risk Engine") },
            ["Reorg"] = new[] { ("NATIXIS", "Risk Engine"), ("NATIXIS", "Pricing Service"), ("MAREX", "Settlement Gateway"), ("NATIXIS", "Reporting Suite") },
            ["International"] = new[] { ("DTC-US", "Trade Capture"), ("NATIXIS", "Risk Engine"), ("BARCLAYS-US", "Pricing Service"), ("MAREX", "Risk Engine") },
        };

        var bulkUsers = new List<User>();
        var bulkAccess = new List<UserToolAccess>();
        var bulkAttests = new List<ToolCycleAttestation>();

        for (int i = 0; i < 600; i++)
        {
            var aid = (4001 + i).ToString();
            var mgr = bulkMgrIds[i % bulkMgrIds.Length];
            var dept = bulkMgrDept[mgr];
            var fn = fNames[rng.Next(fNames.Length)];
            var ln = lNames[rng.Next(lNames.Length)];

            bulkUsers.Add(new User { AssociateId = aid, FirstName = fn, LastName = ln, UserName = $"CORP\\{fn.ToLower()}{aid}", ManagerId = mgr, Department = dept });

            var pool = toolsByDept[dept];
            var picked = new HashSet<(string, string)>();
            int count = 2 + rng.Next(3);
            foreach (var tool in pool.OrderBy(_ => rng.Next()))
            {
                if (picked.Contains((tool.C, tool.T))) continue;
                picked.Add((tool.C, tool.T));
                bulkAccess.Add(new UserToolAccess { AssociateId = aid, ClientID = tool.C, ApplicationName = tool.T, Access = "TRUE", FromDate = accessFrom, ToDate = null });
                if (picked.Count >= count) break;
            }
        }

        db.Users.AddRange(bulkUsers);
        await db.SaveChangesAsync();
        db.UserToolAccess.AddRange(bulkAccess);
        await db.SaveChangesAsync();

        foreach (var uta in bulkAccess)
        {
            var toolId = toolMap.GetValueOrDefault((uta.ClientID, uta.ApplicationName));
            bulkAttests.Add(new ToolCycleAttestation
            {
                CycleID = cycleClosed.CycleID, AssociateId = uta.AssociateId, ClientID = uta.ClientID, ToolID = toolId,
                UsedThisCycle = rng.NextDouble() < 0.75, AttestationStatus = "Submitted",
                SubmittedAt = DateTime.UtcNow.AddDays(-90 + rng.Next(10)),
            });
            var roll = rng.NextDouble();
            if (roll >= 0.30)
            {
                bulkAttests.Add(new ToolCycleAttestation
                {
                    CycleID = cycleActive.CycleID, AssociateId = uta.AssociateId, ClientID = uta.ClientID, ToolID = toolId,
                    UsedThisCycle = rng.NextDouble() < 0.6,
                    AttestationStatus = roll < 0.70 ? "InProgress" : "Submitted",
                    SubmittedAt = roll < 0.70 ? null : DateTime.UtcNow.AddDays(-rng.Next(1, 6)),
                });
            }
        }
        db.ToolCycleAttestations.AddRange(bulkAttests);
        await db.SaveChangesAsync();
    }
}
