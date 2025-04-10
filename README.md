# Google Sheets API MCP Server

    A comprehensive Model Context Protocol (MCP) server for interacting with the Google Sheets API. This server provides tools and resources for managing spreadsheets, sheets, values, and developer metadata.

    ## Features

    - Create, read, update, and delete spreadsheets
    - Manage sheets within spreadsheets
    - Read, write, append, and clear values
    - Work with developer metadata
    - Access spreadsheet data through MCP resources

    ## Prerequisites

    - Node.js 16 or higher
    - Google Cloud Platform project with the Google Sheets API enabled
    - OAuth 2.0 credentials (client ID, client secret, refresh token)

    ## Setup

    1. Clone this repository
    2. Install dependencies:
       ```
       npm install
       ```
    3. Create a `.env` file based on `.env.example` with your Google API credentials:
       ```
       CLIENT_ID=your_client_id
       CLIENT_SECRET=your_client_secret
       REDIRECT_URI=your_redirect_uri
       REFRESH_TOKEN=your_refresh_token
       ```

    ## Usage

    ### Running the server

    ```
    npm start
    ```

    ### Development mode

    ```
    npm run dev
    ```

    ### Testing with MCP Inspector

    ```
    npm run inspect
    ```

    ## Available Tools

    ### Spreadsheet Management

    - `createSpreadsheet`: Create a new spreadsheet
    - `getSpreadsheet`: Get spreadsheet details
    - `batchUpdate`: Apply multiple updates to a spreadsheet

    ### Sheet Management

    - `copySheet`: Copy a sheet to another spreadsheet
    - `addSheet`: Add a new sheet to a spreadsheet
    - `deleteSheet`: Delete a sheet from a spreadsheet
    - `updateSheetProperties`: Update sheet properties

    ### Values Management

    - `getValues`: Get values from a range
    - `updateValues`: Update values in a range
    - `appendValues`: Append values to a range
    - `clearValues`: Clear values from a range
    - `batchGetValues`: Get values from multiple ranges
    - `batchUpdateValues`: Update values in multiple ranges

    ### Developer Metadata

    - `getDeveloperMetadata`: Get all developer metadata
    - `createDeveloperMetadata`: Create new developer metadata
    - `updateDeveloperMetadata`: Update existing developer metadata
    - `deleteDeveloperMetadata`: Delete developer metadata

    ## Available Resources

    - `sheets://spreadsheet/{spreadsheetId}`: Get spreadsheet details
    - `sheets://spreadsheet/{spreadsheetId}/sheet/{sheetName}`: Get sheet details
    - `sheets://spreadsheet/{spreadsheetId}/values/{range}`: Get values from a range
    - `sheets://spreadsheet/{spreadsheetId}/metadata`: Get all developer metadata

    ## Authentication

    This server uses OAuth 2.0 for authentication with the Google Sheets API. You need to provide the following credentials in the `.env` file:

    - `CLIENT_ID`: Your Google API client ID
    - `CLIENT_SECRET`: Your Google API client secret
    - `REDIRECT_URI`: The redirect URI configured in your Google API project
    - `REFRESH_TOKEN`: A refresh token obtained through the OAuth 2.0 flow

    ## License

    MIT
