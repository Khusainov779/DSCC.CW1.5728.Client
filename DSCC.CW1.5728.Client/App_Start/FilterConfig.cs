using System.Web;
using System.Web.Mvc;

namespace DSCC.CW1._5728.Client
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
