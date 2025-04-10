import { google } from 'googleapis';
    import dotenv from 'dotenv';

    dotenv.config();

    // Check if required environment variables are set
    const requiredEnvVars = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI', 'REFRESH_TOKEN'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
      console.warn('Authentication will fail. Please set these variables in a .env file.');
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    // Set credentials using refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });

    // Create and export the sheets API client
    export const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Helper function to handle API errors
    export function handleApiError(error) {
      console.error('Google Sheets API Error:', error);
      
      if (error.response) {
        const { status, statusText, data } = error.response;
        return {
          content: [{ 
            type: "text", 
            text: `API Error (${status} ${statusText}): ${data?.error?.message || JSON.stringify(data)}` 
          }],
          isError: true
        };
      }
      
      return {
        content: [{ type: "text", text: `Error: ${error.message || error}` }],
        isError: true
      };
    }
