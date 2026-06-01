using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DashyDashboard.Api.Models.Domain;

[Table("UsersToolAccess")]
public class UserToolAccess
{
    [Key]
    [Column("UserID")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserID { get; set; }

    [Column("AssociateID", TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string? AssociateId { get; set; }

    [Column(TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string? ClientID { get; set; }

    [Column("Application Name", TypeName = "varchar(255)")]
    [MaxLength(255)]
    public string? ApplicationName { get; set; }

    [Column(TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string? Access { get; set; }

    [Column("FromDate", TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string? FromDate { get; set; }

    [Column("ToDate", TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string? ToDate { get; set; }

    [ForeignKey(nameof(AssociateId))]
    public User? User { get; set; }

    public ClientTool? ClientTool { get; set; }
}
