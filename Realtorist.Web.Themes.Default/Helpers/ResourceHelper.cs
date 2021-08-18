using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Realtorist.Web.Themes.Default.Helpers
{
    public static class ResourceHelper
    {
        public static string ReadResource(string name)
        {
            // Determine path
            var assembly = Assembly.GetExecutingAssembly();
            string resourcePath = assembly.GetManifestResourceNames().Single(str => str.EndsWith(name));

            using (var stream = assembly.GetManifestResourceStream(resourcePath))
            using (var reader = new StreamReader(stream))
            {
                return reader.ReadToEnd();
            }
        }

        public static string[] FixPathInBundle(this IEnumerable<string> files)
        {
            return files.Select(file => file.StartsWith('/') ? file : ContentPrefix + "/" + file).ToArray();
        }

        public static string ContentPrefix => $"_content/{Assembly.GetExecutingAssembly().GetName().Name}";
    }
}