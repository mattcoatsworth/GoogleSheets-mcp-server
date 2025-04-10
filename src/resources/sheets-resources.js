import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
    import { sheets, handleApiError } from '../auth.js';

    export const sheetsResources = [
      {
        name: "spreadsheet",
        template: new ResourceTemplate("sheets://spreadsheet/{spreadsheetId}", { list: undefined }),
        handler: async (uri, { spreadsheetId }) => {
          try {
            const response = await sheets.spreadsheets.get({
              spreadsheetId,
              includeGridData: false
            });
            
            const data = response.data;
            const sheetsList = data.sheets.map(s => s.properties.title).join(', ');
            
            return {
              contents: [{
                uri: uri.href,
                text: `Spreadsheet: ${data.properties.title}
ID: ${data.spreadsheetId}
URL: https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit
Sheets: ${sheetsList}
Locale: ${data.properties.locale || 'Not specified'}
Time Zone: ${data.properties.timeZone || 'Not specified'}`
              }]
            };
          } catch (error) {
            console.error('Error fetching spreadsheet:', error);
            return {
              contents: [{
                uri: uri.href,
                text: `Error fetching spreadsheet: ${error.message}`
              }],
              isError: true
            };
          }
        }
      },
      {
        name: "sheet",
        template: new ResourceTemplate("sheets://spreadsheet/{spreadsheetId}/sheet/{sheetName}", { list: undefined }),
        handler: async (uri, { spreadsheetId, sheetName }) => {
          try {
            const response = await sheets.spreadsheets.get({
              spreadsheetId,
              includeGridData: false
            });
            
            const sheet = response.data.sheets.find(s => 
              s.properties.title.toLowerCase() === sheetName.toLowerCase()
            );
            
            if (!sheet) {
              return {
                contents: [{
                  uri: uri.href,
                  text: `Sheet "${sheetName}" not found in spreadsheet.`
                }],
                isError: true
              };
            }
            
            const props = sheet.properties;
            const gridProps = props.gridProperties || {};
            
            return {
              contents: [{
                uri: uri.href,
                text: `Sheet: ${props.title}
Sheet ID: ${props.sheetId}
Index: ${props.index}
Row Count: ${gridProps.rowCount || 'Unknown'}
Column Count: ${gridProps.columnCount || 'Unknown'}
Frozen Rows: ${gridProps.frozenRowCount || 0}
Frozen Columns: ${gridProps.frozenColumnCount || 0}
Hidden: ${props.hidden ? 'Yes' : 'No'}
Right-to-Left: ${props.rightToLeft ? 'Yes' : 'No'}`
              }]
            };
          } catch (error) {
            console.error('Error fetching sheet:', error);
            return {
              contents: [{
                uri: uri.href,
                text: `Error fetching sheet: ${error.message}`
              }],
              isError: true
            };
          }
        }
      },
      {
        name: "values",
        template: new ResourceTemplate("sheets://spreadsheet/{spreadsheetId}/values/{range}", { list: undefined }),
        handler: async (uri, { spreadsheetId, range }) => {
          try {
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range,
              valueRenderOption: "FORMATTED_VALUE"
            });
            
            const values = response.data.values || [];
            
            if (values.length === 0) {
              return {
                contents: [{
                  uri: uri.href,
                  text: `No data found in range "${range}".`
                }]
              };
            }
            
            // Format values as a table
            const formattedValues = values.map(row => row.join('\t')).join('\n');
            
            return {
              contents: [{
                uri: uri.href,
                text: `Values in range "${range}":\n\n${formattedValues}`
              }]
            };
          } catch (error) {
            console.error('Error fetching values:', error);
            return {
              contents: [{
                uri: uri.href,
                text: `Error fetching values: ${error.message}`
              }],
              isError: true
            };
          }
        }
      },
      {
        name: "metadata",
        template: new ResourceTemplate("sheets://spreadsheet/{spreadsheetId}/metadata", { list: undefined }),
        handler: async (uri, { spreadsheetId }) => {
          try {
            const response = await sheets.spreadsheets.developerMetadata.search({
              spreadsheetId,
              resource: {
                dataFilters: [{}] // Empty filter to get all metadata
              }
            });
            
            const matchedMetadata = response.data.matchedDeveloperMetadata || [];
            
            if (matchedMetadata.length === 0) {
              return {
                contents: [{
                  uri: uri.href,
                  text: "No developer metadata found in this spreadsheet."
                }]
              };
            }
            
            let resultText = `Developer Metadata for Spreadsheet ${spreadsheetId}:\n\n`;
            
            matchedMetadata.forEach((item, i) => {
              const metadata = item.developerMetadata;
              resultText += `Metadata ${i+1}:\n`;
              resultText += `- ID: ${metadata.metadataId}\n`;
              resultText += `- Key: ${metadata.metadataKey}\n`;
              resultText += `- Value: ${metadata.metadataValue}\n`;
              resultText += `- Visibility: ${metadata.visibility}\n`;
              
              if (metadata.location.spreadsheet) {
                resultText += `- Location: Spreadsheet level\n`;
              } else if (metadata.location.sheetId) {
                resultText += `- Location: Sheet (ID: ${metadata.location.sheetId})\n`;
              } else if (metadata.location.dimensionRange) {
                const dr = metadata.location.dimensionRange;
                resultText += `- Location: Dimension Range (Sheet ID: ${dr.sheetId}, Dimension: ${dr.dimension}, Start: ${dr.startIndex}, End: ${dr.endIndex})\n`;
              }
              
              resultText += '\n';
            });
            
            return {
              contents: [{
                uri: uri.href,
                text: resultText.trim()
              }]
            };
          } catch (error) {
            console.error('Error fetching metadata:', error);
            return {
              contents: [{
                uri: uri.href,
                text: `Error fetching metadata: ${error.message}`
              }],
              isError: true
            };
          }
        }
      }
    ];
