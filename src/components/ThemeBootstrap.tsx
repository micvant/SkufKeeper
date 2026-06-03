export function ThemeBootstrap() {
  const script = `
(function () {
  try {
    var theme = localStorage.getItem("skufkeeper-app-theme");
    var scheme = localStorage.getItem("skufkeeper-color-scheme");
    if (theme) document.documentElement.setAttribute("data-app-theme", theme);
    var resolved = "light";
    if (scheme === "dark") resolved = "dark";
    else if (scheme === "light") resolved = "light";
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) resolved = "dark";
    document.documentElement.setAttribute("data-color-scheme", resolved);
  } catch (e) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
