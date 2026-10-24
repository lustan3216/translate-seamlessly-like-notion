import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export function render(url: string) {
  const helmetContext: { helmet?: Record<string, { toString: () => string }> } = {};
  const html = renderToString(
    <StaticRouter location={url}><App helmetContext={helmetContext} /></StaticRouter>
  );
  const helmet = helmetContext.helmet!;
  return {
    html,
    head: ['title', 'meta', 'link', 'script'].map((name) => helmet[name].toString()).join('\n'),
    htmlAttributes: helmet.htmlAttributes.toString(),
  };
}
