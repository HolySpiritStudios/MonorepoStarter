import { ChatController } from '../../app/chat/controllers/chat.controller';
import { ChatRouter } from '../../app/chat/routers/chat.router';
import { ChatService } from '../../app/chat/services/chat.service';
import { SecretsService } from '../../app/common/integrations/aws/services/secrets.service';
import { Environment, EnvironmentService, EnvironmentVariable } from '../../app/common/utils/environment.util';
import { getAppLogger } from '../../app/common/utils/logger.util';

const logger = getAppLogger('chat-service-container');

interface MCPServer {
  url: string;
  apiKey: string;
  name?: string; // Optional name for tool namespacing
}

interface ChatSecrets {
  /**
   * MCP_SERVERS: Comma-delimited list of MCP servers in format "name|url|apiKey,name|url|apiKey"
   * Name is optional: "url|apiKey" also works, will use "server1", "server2", etc.
   * Example with names: "shortio|https://api1.com/mcp|key123,custom|https://api2.com/mcp|key456"
   * Example without names: "https://api1.com/mcp|key123,https://api2.com/mcp|key456"
   */
  MCP_SERVERS?: string;

  /**
   * CHAT_MODEL: Optional Bedrock model ID to use for chat
   * Examples:
   * - "anthropic.claude-opus-4-5-20251101-v1:0" (default, best for complex reasoning)
   * - "anthropic.claude-sonnet-4-20250514-v1:0" (faster, more cost-effective)
   * If not specified, defaults to Claude Opus 4.5
   */
  CHAT_MODEL?: string;
}

/**
 * Parse comma-delimited MCP servers from secrets
 * Format: "name|url|apiKey,name|url|apiKey,..." or "url|apiKey,url|apiKey,..."
 */
function parseMCPServers(mcpServersString?: string): MCPServer[] {
  if (!mcpServersString) {
    return [];
  }

  const servers: MCPServer[] = [];

  mcpServersString
    .split(',')
    .map((serverStr) => serverStr.trim())
    .filter((serverStr) => serverStr.length > 0)
    .forEach((serverStr, index) => {
      const parts = serverStr.split('|').map((s) => s.trim());

      // Support both formats: "name|url|apiKey" and "url|apiKey"
      if (parts.length === 3) {
        const [name, url, apiKey] = parts;
        if (!url || !apiKey) {
          logger.warn('Invalid MCP server format, skipping', { serverStr });
          return;
        }
        servers.push({ name, url, apiKey });
      } else if (parts.length === 2) {
        const [url, apiKey] = parts;
        if (!url || !apiKey) {
          logger.warn('Invalid MCP server format, skipping', { serverStr });
          return;
        }
        servers.push({ url, apiKey, name: `server${index + 1}` });
      } else {
        logger.warn('Invalid MCP server format, expected "name|url|apiKey" or "url|apiKey", skipping', { serverStr });
      }
    });

  return servers;
}

/**
 * Build ChatRouter with all dependencies
 *
 * MCP Integration:
 * - Supports multiple MCP servers via comma-delimited MCP_SERVERS secret
 * - Format with names: "name|url|apiKey,name|url|apiKey"
 * - Format without names: "url|apiKey,url|apiKey" (auto-assigned server1, server2, etc.)
 * - Tools are namespaced by server name to prevent conflicts
 * - Example: "shortio|https://api1.com/mcp|key1,custom|https://api2.com/mcp|key2"
 * - Chat works without MCP if not configured (graceful degradation)
 *
 * Model Configuration:
 * - Optional CHAT_MODEL secret to override the default model
 * - Defaults to Claude Opus 4.5 if not specified
 * - Example: "anthropic.claude-sonnet-4-20250514-v1:0" for cost optimization
 *
 * ContextService is optional - can be injected for domain-specific context
 */
export async function buildChatRouter(config: Partial<Environment> = {}): Promise<ChatRouter> {
  logger.info('Building chat router');

  const environmentService = new EnvironmentService(config);
  const secretsService = new SecretsService(environmentService);

  const secretId = environmentService.get(EnvironmentVariable.SECRET_ID);
  const secrets = await secretsService.getSecret<ChatSecrets>(secretId);

  const mcpServers = parseMCPServers(secrets.MCP_SERVERS);

  // Optional: Implement ContextService here for session-specific context
  // Example:
  // const contextService = new SessionContextService(...);
  // const chatService = await ChatService.create({ mcpServers, model: secrets.CHAT_MODEL }, contextService);

  const chatService = await ChatService.create({
    mcpServers,
    model: secrets.CHAT_MODEL,
  });

  const chatController = new ChatController(chatService);

  logger.info('Chat router built successfully', { mcpServerCount: mcpServers.length });
  return new ChatRouter(chatController);
}
