using ExtCore.Infrastructure.Actions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NUglify.JavaScript;
using Realtorist.Web.Themes.Default.Helpers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.Loader;

namespace Realtorist.Web.Themes.Default
{
    public class Startup : IConfigureServicesAction, IConfigureAction
    {
        public int Priority => 2;

        void IConfigureServicesAction.Execute(IServiceCollection services, IServiceProvider serviceProvider)
        {
            var env = serviceProvider.GetService<IWebHostEnvironment>();
            var logger = serviceProvider.GetService<ILogger<Startup>>();

            var assemblyPath = Assembly.GetExecutingAssembly().Location;
            var assemblyDirectory = Path.GetDirectoryName(assemblyPath);

            var fileProvider = new PhysicalFileProvider(assemblyDirectory + "/wwwroot");
            env.WebRootFileProvider = new CompositeFileProvider(fileProvider, env.WebRootFileProvider);

            AssemblyLoadContext.GetLoadContext(Assembly.GetExecutingAssembly()).ResolvingUnmanagedDll += (assembly, libraryName) =>
            {
                logger.LogInformation($"Event: Looking for native library: {libraryName}, assembly: {assembly}");
                var context = new PluginLoadContext(assemblyPath);
                var result = context.LoadNativeDll(libraryName);

                if (result != IntPtr.Zero)
                {
                    logger.LogInformation($"Event: Successfully resolved native library: {libraryName}, assembly: {assembly}");
                }
                
                return result;
            };
            
            services.AddSingleton<StyleOverridesFileProvider>();
            var bundleConfig = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, Dictionary<string, string[]>>>>(ResourceHelper.ReadResource("bundles.json"));
            services.AddWebOptimizer(pipeline =>
            {
                pipeline.AddCssBundle("/css/lib.css", bundleConfig["website"]["lib"]["css"].FixPathInBundle()).MinifyCss();
                pipeline.AddJavaScriptBundle("/js/lib.js", bundleConfig["website"]["lib"]["js"].FixPathInBundle()).MinifyJavaScript();

                pipeline.AddJavaScriptBundle(
                    "/js/build.js",
                    new CodeSettings
                    {
                        MinifyCode = env.IsProduction()
                    },
                    bundleConfig["website"]["build"]["js"].FixPathInBundle());

                var buildScss = pipeline.AddScssBundle("/css/styles.css", bundleConfig["website"]["build"]["scss"].FixPathInBundle());

                if (env.IsProduction())
                {
                    buildScss.MinifyCss();
                    //pipeline.MinifyJsFiles();
                }
            });
        }

        void IConfigureAction.Execute(IApplicationBuilder app, IServiceProvider serviceProvider)
        {
            var env = serviceProvider.GetService<IWebHostEnvironment>();
            var styleOverridesFileProvider = serviceProvider.GetService<StyleOverridesFileProvider>();
            
            app.UseWebOptimizer(env, new[] {
                new WebOptimizer.FileProviderOptions {
                    RequestPath = "/overrides",
                    FileProvider = styleOverridesFileProvider
                }
            });
        }
    }
}
