using System.ComponentModel.DataAnnotations;

namespace DashyDashboard.Api.Models.DTOs;

public record TeamDto(
    int TotalMembers,
    int TotalTools,
    int TotalAttested,
    int Submitted,
    int InProgress,
    int NotStarted,
    List<TeamMemberDto> Members
);

public record TeamMemberDto(
    string AssociateId,
    string FullName,
    string AttestationStatus,
    int TotalTools,
    int AttestedTools,
    double ProgressPct
);

public record MemberDetailDto(
    string AssociateId,
    string FullName,
    string AttestationStatus,
    int TotalTools,
    int AttestedTools,
    double ProgressPct,
    List<ClientProgressDto> ByClient
);

public record ClientProgressDto(
    string ClientID,
    string ClientName,
    int TotalTools,
    int AttestedTools
);

public record GrantAccessRequest(
    [Required][MaxLength(50)] string ClientID,
    [Required] int ToolID,
    DateOnly? AccessFrom = null,
    DateOnly? AccessTo = null
);

public record UpdateAccessEndDateRequest(DateOnly? AccessTo);

public record MemberAccessDto(
    string ClientID,
    string ClientName,
    List<AccessRowDto> Tools
);

public record AccessRowDto(
    int ToolID,
    string ToolName,
    string AccessFrom,
    string? AccessTo
);

public record UserListItem(
    string AssociateId,
    string FirstName,
    string LastName,
    string FullName,
    string? UserName,
    string? Department,
    string? ManagerId,
    string? ManagerName
);
