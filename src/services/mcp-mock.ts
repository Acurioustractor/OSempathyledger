// This file mocks the MCP functions for production builds,
// as the 'mcp' module is only available in the development environment.

export const mcp_airtable_list_records = async (options: any) => {
  console.warn('MCP-MOCK: mcp_airtable_list_records called in production build. Returning empty array.');
  return { records: [] };
};

export const mcp_airtable_create_record = async (options: any) => {
  console.warn('MCP-MOCK: mcp_airtable_create_record called in production build. This is a no-op.');
  return { id: 'mock_id', fields: {} };
};

export const mcp_airtable_update_records = async (options: any) => {
  console.warn('MCP-MOCK: mcp_airtable_update_records called in production build. This is a no-op.');
  return;
};

export const mcp_airtable_delete_records = async (options: any) => {
  console.warn('MCP-MOCK: mcp_airtable_delete_records called in production build. This is a no-op.');
  return;
}; 