export function generateStaticParams() {
  return [{ slug: [] }, { slug: ['index'] }];
}

export default function ValuesRedirect() {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content="0; url=/ontologies/core/values" />
        <title>Redirecting...</title>
      </head>
      <body>
        <p>Redirecting to <a href="/ontologies/core/values">/ontologies/core/values</a>...</p>
      </body>
    </html>
  );
}
