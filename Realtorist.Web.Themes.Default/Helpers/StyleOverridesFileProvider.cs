using System;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Realtorist.Models.Helpers;
using Realtorist.Models.Settings.Appearance;
using Realtorist.Models.Settings.Appearance.Theme;
using Realtorist.Services.Abstractions.Providers;

namespace Realtorist.Web.Themes.Default.Helpers
{
    public class StyleOverridesFileProvider : IFileProvider
    {
        private class StyleOverridesFileInfo : IFileInfo
        {
            private readonly string _content;
            private readonly string _fileName;
            private readonly string _directory;

            public StyleOverridesFileInfo(string contnet, string directory, string fileName)
            {
                _content = !contnet.IsNullOrEmpty() ? contnet : " ";
                _fileName = fileName ?? throw new ArgumentNullException(nameof(fileName));
                _directory = directory ?? throw new ArgumentNullException(nameof(directory));
            }

            public bool Exists => true;

            public bool IsDirectory => false;

            public DateTimeOffset LastModified => DateTimeOffset.Now;

            public long Length => _content.Length;

            public string Name => _fileName;

            public string PhysicalPath => $"{_directory}/{_fileName}";

            public Stream CreateReadStream() => new MemoryStream(Encoding.UTF8.GetBytes(_content));
        }

        private readonly ISettingsProvider _settingsProvider;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger _logger;
        public ConfigurationReloadToken ChangeToken { get; } = new ConfigurationReloadToken();

        public StyleOverridesFileProvider(ISettingsProvider settingsProvider, IWebHostEnvironment environment, ILogger<StyleOverridesFileProvider> logger)
        {
            _settingsProvider = settingsProvider ?? throw new ArgumentNullException(nameof(settingsProvider));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        }

        public IDirectoryContents GetDirectoryContents(string subpath)
        {
            return new NotFoundDirectoryContents();
        }

        public IFileInfo GetFileInfo(string subpath)
        {
            var stylesInFile = "_content/Realtorist.Web.Themes.Default/css/_style.scss";
            var fileInfo = _environment.WebRootFileProvider.GetFileInfo(stylesInFile);
            var physicalPathDirectory = Path.GetDirectoryName(fileInfo.PhysicalPath);

            if (subpath.ToLower().EndsWith(".scss"))
            {
                _logger.LogInformation("Writing overrides.scss");

                var settings = _settingsProvider.GetSettingAsync<ThemeSettings>(AppearanceSettingTypes.ThemeSettings).Result;
                var overrideStyles = settings.StyleOverrides?
                    .Where(x => !x.Value.IsNullOrEmpty())
                    .Select(x => $"${x.Key}: {(!x.Value.StartsWith("http") ? x.Value : $"'{x.Value}'")};")
                    .Join(Environment.NewLine);

                var dateLine = $"//Wrote on {DateTime.Now}";;

                using (var stylesContentStream = fileInfo.CreateReadStream())
                using (var reader = new StreamReader(stylesContentStream))
                {
                    var stylesContent = reader.ReadToEnd();

                    stylesContent = stylesContent.Replace("//ReplaceWithOverrides", overrideStyles);
                    stylesContent += Environment.NewLine + dateLine;

                    return new StyleOverridesFileInfo(stylesContent, physicalPathDirectory, "overrides.scss");
                }
            } else {
                _logger.LogInformation("Writing overrides.css");

                var settings = _settingsProvider.GetSettingAsync<ThemeSettings>(AppearanceSettingTypes.ThemeSettings).Result;
                return new StyleOverridesFileInfo(settings.AdditionalCss ?? string.Empty, physicalPathDirectory, "overrides.css");
            }
        }

        public IChangeToken Watch(string filter)
        {
            return ChangeToken;
        }
    }
}