import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/status', (req, res) => {
    res.json({
      hunter: !!(process.env.HUNTER_API_KEY || process.env.VITE_HUNTER_API_KEY),
      linkedin: !!process.env.LINKEDIN_CLIENT_ID,
      gemini: !!process.env.GEMINI_API_KEY
    });
  });

  // LinkedIn Auth URL
  app.get('/api/auth/linkedin/url', (req, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      console.error('LinkedIn Auth Error: LINKEDIN_CLIENT_ID is missing');
      return res.status(500).json({ error: 'LINKEDIN_CLIENT_ID not configured' });
    }

    const host = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${host}/api/auth/linkedin/callback`;
    // Modernized scopes: openid, profile, and email are the new standards
    const scope = 'openid profile email w_member_social'; 

    console.log(`Generating LinkedIn Auth URL with redirect: ${redirectUri}`);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      state: 'random_state_string' 
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // Hunter.io Proxy
  app.get('/api/hunter/search', async (req, res) => {
    const { domain } = req.query;
    const apiKey = process.env.HUNTER_API_KEY || process.env.VITE_HUNTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Hunter.io API key not configured' });
    }

    try {
      const response = await axios.get('https://api.hunter.io/v2/domain-search', {
        params: {
          domain,
          api_key: apiKey
        }
      });
      res.json(response.data);
    } catch (err: any) {
      console.error('Hunter.io Error:', err.response?.data || err.message);
      res.status(err.response?.status || 500).json(err.response?.data || { error: 'Hunter.io request failed' });
    }
  });

  // LinkedIn Callback
  app.get(['/api/auth/linkedin/callback', '/api/auth/linkedin/callback/'], async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
      console.error('LinkedIn Auth Callback Error:', error, error_description);
      return res.send(`
        <script>
          window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: '${error_description || error}' }, '*');
          window.close();
        </script>
      `);
    }

    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
      const host = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${host}/api/auth/linkedin/callback`;

      console.log(`Exchanging LinkedIn code for token. Redirect URI used: ${redirectUri}`);

      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token } = response.data;
      
      // In a real app, we'd save this to a database associated with the user
      // For this demo, we'll pass it back to the client to store in Firestore locally
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'LINKEDIN_AUTH_SUCCESS', 
                  accessToken: '${access_token}' 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('LinkedIn Auth Error:', err.response?.data || err.message);
      res.send(`
        <script>
          window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: 'Failed to exchange code' }, '*');
          window.close();
        </script>
      `);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
