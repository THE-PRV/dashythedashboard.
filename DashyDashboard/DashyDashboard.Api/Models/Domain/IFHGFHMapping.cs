using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DashyDashboard.Api.Models.Domain;

[Table("IFHGFHMapping")]
public class IFHGFHMapping
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    [MaxLength(150)]
    public string Area { get; set; } = "";

    [MaxLength(150)]
    public string IFH { get; set; } = "";

    [MaxLength(150)]
    public string GFH { get; set; } = "";
}
