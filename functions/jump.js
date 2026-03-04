export async function onRequest(context) {
  const websites = [
    "https://www.google.com",
    "https://github.com",
    "https://www.cloudflare.com",
    "https://astro.build",
    "https://www.roblox.com",
    "https://paramecium2010.top",
    "https://hydrolight.top",
    "https://www.odysphere.tech",
    "https://gemini.google.com",
    "https://stackoverflow.com",
    "https://www.wikipedia.org",
    "https://www.youtube.com"
  ];

  const randomIndex = Math.floor(Math.random() * websites.length);
  const targetUrl = websites[randomIndex];

  return new Response(null, {
    status: 302,
    headers: {
      'Location': targetUrl
    }
  });
}
