using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DashyDashboard.Api.Models.Domain;

[Table("SuperUsers")]
public class SuperUser
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SuperUserID { get; set; }

    [Column("AssociateID", TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string AssociateId { get; set; } = "";

    [Column(TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string RoleName { get; set; } = "";

    [MaxLength(150)]
    public string Department { get; set; } = "";

    [Column(TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string? AccessLevel { get; set; }

    [Column(TypeName = "varchar(10)")]
    [MaxLength(10)]
    public string IsActive { get; set; } = "TRUE";

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "varchar(50)")]
    [MaxLength(50)]
    public string? CreatedBy { get; set; }
}
