"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Server, Check, Info, AlertTriangle } from "lucide-react"

export default function PythonImplementationPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12">
          <div className="mb-8">
            <nav className="mb-4 flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/building-servers" className="hover:text-foreground">
                Building MCP Servers
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/servers/implementation" className="hover:text-foreground">
                Implementation
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Python</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">Building MCP Servers with Python</h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive guide to implementing robust MCP servers using Python with a focus on data processing and AI integration.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
            <p className="mb-4">
              Python is an ideal choice for building MCP servers when you need to integrate with data science libraries, 
              machine learning models, or when you prefer Python's clean syntax and comprehensive ecosystem. 
              This guide will walk you through creating a full-featured MCP server in Python.
            </p>

            <div className="bg-muted p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Python 3.8 or higher</li>
                <li>pip package manager</li>
                <li>Basic knowledge of Python and async programming</li>
                <li>Understanding of the MCP protocol basics</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 1: Project Setup</h2>
            <p className="mb-4">
              Let's begin by setting up a new Python project and installing the required dependencies.
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# Create a new directory for your project
mkdir mcp-python-server
cd mcp-python-server

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
# source venv/bin/activate

# Install the MCP SDK and other dependencies
pip install fastapi uvicorn python-dotenv pydantic`}</code>
            </pre>

            <p className="mb-4">
              Since the official MCP SDK is primarily designed for JavaScript/TypeScript, we'll 
              implement the protocol ourselves in Python, following the specifications closely.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 2: Create the Project Structure</h2>
            <p className="mb-4">
              Let's set up a well-organized project structure. Create the following directory structure:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`mcp-python-server/
├── .env                  # Environment variables
├── config.py             # Configuration settings
├── server.py             # Core MCP server implementation
├── main.py               # Entry point for the application
├── mcp/
│   ├── __init__.py
│   ├── types.py          # MCP protocol type definitions
│   ├── schemas.py        # Pydantic schemas for request/response
│   └── transport.py      # Transport layer implementations
├── tools/
│   ├── __init__.py
│   ├── registry.py       # Tool registration system
│   ├── weather.py        # Weather tool implementation
│   └── calculator.py     # Calculator tool implementation
└── context/
    ├── __init__.py
    └── manager.py        # Context management system`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 3: Define MCP Protocol Types</h2>
            <p className="mb-4">
              First, let's define the core types for the MCP protocol. Create a file called <code>mcp/types.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# mcp/types.py
from enum import Enum
from typing import Dict, List, Any, Optional

class RequestMethod(str, Enum):
    LIST_TOOLS = "list_tools"
    CALL_TOOL = "call_tool"
    GET_CONTEXT = "get_context"
    SET_CONTEXT = "set_context"

class ErrorCode(str, Enum):
    INVALID_REQUEST = "invalid_request"
    TOOL_NOT_FOUND = "tool_not_found"
    TOOL_EXECUTION_ERROR = "tool_execution_error"
    CONTEXT_ERROR = "context_error"
    INTERNAL_ERROR = "internal_error"

class MCPError(Exception):
    def __init__(self, code: ErrorCode, message: str):
        self.code = code
        self.message = message
        super().__init__(message)
        
    def to_dict(self) -> Dict[str, str]:
        return {
            "error": {
                "code": self.code,
                "message": self.message
            }
        }`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 4: Create Request/Response Schemas</h2>
            <p className="mb-4">
              Now, let's define the schemas for MCP requests and responses using Pydantic. Create <code>mcp/schemas.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# mcp/schemas.py
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from .types import RequestMethod

class ToolSchema(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]

class ListToolsRequest(BaseModel):
    method: str = RequestMethod.LIST_TOOLS

class ListToolsResponse(BaseModel):
    tools: List[ToolSchema]

class CallToolRequest(BaseModel):
    method: str = RequestMethod.CALL_TOOL
    name: str
    parameters: Dict[str, Any]

class CallToolResponse(BaseModel):
    result: Dict[str, Any]

class GetContextRequest(BaseModel):
    method: str = RequestMethod.GET_CONTEXT
    context_id: str

class GetContextResponse(BaseModel):
    context: Dict[str, Any]

class SetContextRequest(BaseModel):
    method: str = RequestMethod.SET_CONTEXT
    context_id: str
    data: Dict[str, Any]

class SetContextResponse(BaseModel):
    success: bool

class ErrorResponse(BaseModel):
    error: Dict[str, str]`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 5: Implement Transport Layer</h2>
            <p className="mb-4">
              Let's create the transport layer for our MCP server. We'll implement both stdio and HTTP transports. Create <code>mcp/transport.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# mcp/transport.py
import sys
import json
import asyncio
from typing import Dict, Any, Callable, Awaitable
from fastapi import FastAPI, HTTPException
from .types import MCPError, ErrorCode

class BaseTransport:
    def __init__(self):
        self.request_handler: Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]] = None
        
    def set_request_handler(self, handler: Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]):
        self.request_handler = handler
        
    async def send_response(self, response: Dict[str, Any]):
        raise NotImplementedError("Subclasses must implement send_response")
        
    async def start(self):
        raise NotImplementedError("Subclasses must implement start")
        
    async def stop(self):
        raise NotImplementedError("Subclasses must implement stop")

class StdioTransport(BaseTransport):
    def __init__(self):
        super().__init__()
        self._running = False
        
    async def send_response(self, response: Dict[str, Any]):
        sys.stdout.write(json.dumps(response) + "\\n")
        sys.stdout.flush()
        
    async def _read_request(self):
        try:
            line = sys.stdin.readline().strip()
            if not line:
                return None
            return json.loads(line)
        except json.JSONDecodeError:
            raise MCPError(
                ErrorCode.INVALID_REQUEST, 
                "Invalid JSON in request"
            )
        
    async def start(self):
        self._running = True
        while self._running:
            try:
                request = await self._read_request()
                if not request:
                    await asyncio.sleep(0.1)
                    continue
                    
                if not self.request_handler:
                    raise MCPError(
                        ErrorCode.INTERNAL_ERROR, 
                        "No request handler registered"
                    )
                    
                response = await self.request_handler(request)
                await self.send_response(response)
                
            except MCPError as e:
                await self.send_response(e.to_dict())
            except Exception as e:
                error = MCPError(
                    ErrorCode.INTERNAL_ERROR, 
                    f"Unexpected error: {str(e)}"
                )
                await self.send_response(error.to_dict())
                
    async def stop(self):
        self._running = False

class HttpTransport(BaseTransport):
    def __init__(self, host: str = "0.0.0.0", port: int = 8000):
        super().__init__()
        self.host = host
        self.port = port
        self.app = FastAPI(title="MCP Server")
        self.server = None
        
        @self.app.post("/")
        async def handle_request(request: Dict[str, Any]):
            try:
                if not self.request_handler:
                    raise MCPError(
                        ErrorCode.INTERNAL_ERROR, 
                        "No request handler registered"
                    )
                    
                return await self.request_handler(request)
            except MCPError as e:
                raise HTTPException(
                    status_code=400, 
                    detail=e.to_dict()["error"]
                )
        
    async def send_response(self, response: Dict[str, Any]):
        # HTTP responses are handled automatically by FastAPI
        pass
        
    async def start(self):
        import uvicorn
        self.server = uvicorn.Server(
            uvicorn.Config(
                self.app, 
                host=self.host, 
                port=self.port,
                log_level="info"
            )
        )
        await self.server.serve()
        
    async def stop(self):
        if self.server:
            self.server.should_exit = True`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 6: Implement Tool Registry</h2>
            <p className="mb-4">
              Let's create a system for registering and managing tools. Create <code>tools/registry.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# tools/registry.py
from typing import Dict, List, Any, Callable, Awaitable
import logging

logger = logging.getLogger(__name__)

class Tool:
    def __init__(
        self, 
        name: str, 
        description: str, 
        input_schema: Dict[str, Any],
        handler: Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]
    ):
        self.name = name
        self.description = description
        self.input_schema = input_schema
        self.handler = handler
        
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema
        }

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
        
    def register_tool(self, tool: Tool) -> None:
        logger.info(f"Registering tool: {tool.name}")
        self.tools[tool.name] = tool
        
    def get_tool(self, name: str) -> Tool:
        return self.tools.get(name)
        
    def list_tools(self) -> List[Dict[str, Any]]:
        return [tool.to_dict() for tool in self.tools.values()]
        
    async def call_tool(self, name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        tool = self.get_tool(name)
        if not tool:
            from mcp.types import MCPError, ErrorCode
            raise MCPError(
                ErrorCode.TOOL_NOT_FOUND, 
                f"Tool not found: {name}"
            )
            
        logger.info(f"Calling tool: {name} with parameters: {parameters}")
        try:
            return await tool.handler(parameters)
        except Exception as e:
            from mcp.types import MCPError, ErrorCode
            logger.error(f"Error executing tool {name}: {str(e)}")
            raise MCPError(
                ErrorCode.TOOL_EXECUTION_ERROR, 
                f"Error executing tool {name}: {str(e)}"
            )`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 7: Implement Sample Tools</h2>
            <p className="mb-4">
              Now, let's implement some sample tools to demonstrate the functionality. First, let's create <code>tools/weather.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# tools/weather.py
from datetime import datetime
from typing import Dict, Any

async def get_weather(parameters: Dict[str, Any]) -> Dict[str, Any]:
    location = parameters.get("location")
    if not location:
        raise ValueError("Location is required")
        
    # In a real implementation, you would call a weather API here
    # For demonstration, we're returning mock data
    return {
        "result": {
            "temperature": 72,
            "condition": "Sunny",
            "location": location,
            "timestamp": datetime.now().isoformat()
        }
    }

weather_tool = {
    "name": "get_weather",
    "description": "Get the current weather for a location",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City name or coordinates"
            }
        },
        "required": ["location"]
    },
    "handler": get_weather
}`}</code>
            </pre>

            <p className="mb-4">
              Next, let's create <code>tools/calculator.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# tools/calculator.py
from typing import Dict, Any
import ast
import operator

# Define safe operations
safe_operators = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod
}

class SafeEvaluator(ast.NodeVisitor):
    def __init__(self):
        self.result = 0
        
    def visit_BinOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        op_type = type(node.op)
        
        if op_type not in safe_operators:
            raise ValueError(f"Unsupported operation: {op_type.__name__}")
            
        return safe_operators[op_type](left, right)
        
    def visit_Num(self, node):
        return node.n
        
    def visit_UnaryOp(self, node):
        operand = self.visit(node.operand)
        if isinstance(node.op, ast.USub):
            return -operand
        elif isinstance(node.op, ast.UAdd):
            return operand
        else:
            raise ValueError(f"Unsupported unary operation: {type(node.op).__name__}")
            
    def generic_visit(self, node):
        raise ValueError(f"Unsupported node type: {type(node).__name__}")
        
def safe_eval(expr):
    try:
        tree = ast.parse(expr, mode='eval')
        evaluator = SafeEvaluator()
        return evaluator.visit(tree.body)
    except Exception as e:
        raise ValueError(f"Invalid expression: {str(e)}")

async def calculate(parameters: Dict[str, Any]) -> Dict[str, Any]:
    expression = parameters.get("expression")
    if not expression:
        raise ValueError("Expression is required")
        
    try:
        result = safe_eval(expression)
        return {
            "result": {
                "expression": expression,
                "result": result
            }
        }
    except Exception as e:
        raise ValueError(f"Error calculating result: {str(e)}")

calculator_tool = {
    "name": "calculate",
    "description": "Perform a mathematical calculation",
    "input_schema": {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "Math expression to evaluate (e.g., '2 + 2')"
            }
        },
        "required": ["expression"]
    },
    "handler": calculate
}`}</code>
            </pre>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg my-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-300">Security Note</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Unlike the Node.js example that used <code>eval()</code>, we've implemented a secure math expression evaluator 
                    using Python's abstract syntax tree (AST) to prevent code injection attacks.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 8: Implement Context Management</h2>
            <p className="mb-4">
              Let's create a system for managing conversation context. Create <code>context/manager.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# context/manager.py
import json
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class ContextManager:
    def __init__(self, max_context_size: int = 10000):
        self.contexts: Dict[str, Dict[str, Any]] = {}
        self.max_context_size = max_context_size
        
    def set_context(self, context_id: str, data: Dict[str, Any]) -> bool:
        # Check if context is too large
        data_str = json.dumps(data)
        if len(data_str) > self.max_context_size:
            logger.warning(
                f"Context size exceeds limit ({len(data_str)} > {self.max_context_size}). "
                "Consider implementing context compression."
            )
            # In a real implementation, you might want to implement context truncation
            # or compression rather than rejecting the data
            
        self.contexts[context_id] = data
        return True
        
    def get_context(self, context_id: str) -> Optional[Dict[str, Any]]:
        return self.contexts.get(context_id)
        
    def delete_context(self, context_id: str) -> bool:
        if context_id in self.contexts:
            del self.contexts[context_id]
            return True
        return False
        
    def list_contexts(self) -> List[str]:
        return list(self.contexts.keys())`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 9: Create the Configuration</h2>
            <p className="mb-4">
              Let's create a configuration module to load environment variables. Create a <code>.env</code> file:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# .env
SERVER_NAME=python-mcp-server
SERVER_VERSION=1.0.0
TRANSPORT_TYPE=stdio  # or http
HTTP_HOST=0.0.0.0
HTTP_PORT=8000
LOG_LEVEL=INFO`}</code>
            </pre>

            <p className="mb-4">
              Now, create <code>config.py</code> to load these settings:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# config.py
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Server configuration
SERVER_CONFIG = {
    "name": os.getenv("SERVER_NAME", "python-mcp-server"),
    "version": os.getenv("SERVER_VERSION", "1.0.0"),
}

# Transport configuration
TRANSPORT_TYPE = os.getenv("TRANSPORT_TYPE", "stdio")  # "stdio" or "http"
HTTP_HOST = os.getenv("HTTP_HOST", "0.0.0.0")
HTTP_PORT = int(os.getenv("HTTP_PORT", "8000"))

# Context configuration
MAX_CONTEXT_SIZE = int(os.getenv("MAX_CONTEXT_SIZE", "10000"))`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 10: Create the MCP Server</h2>
            <p className="mb-4">
              Now, let's implement the core MCP server. Create <code>server.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# server.py
import asyncio
import logging
from typing import Dict, Any, Callable, Awaitable, Optional
import json

from mcp.transport import BaseTransport, StdioTransport, HttpTransport
from mcp.types import RequestMethod, MCPError, ErrorCode
from tools.registry import ToolRegistry, Tool
from context.manager import ContextManager
import config

logger = logging.getLogger(__name__)

class MCPServer:
    def __init__(self, server_config: Dict[str, str]):
        self.name = server_config.get("name", "python-mcp-server")
        self.version = server_config.get("version", "1.0.0")
        self.transport: Optional[BaseTransport] = None
        self.tool_registry = ToolRegistry()
        self.context_manager = ContextManager(
            max_context_size=config.MAX_CONTEXT_SIZE
        )
        self._request_handlers = {}
        
    def register_tool(self, tool_config: Dict[str, Any]) -> None:
        tool = Tool(
            name=tool_config["name"],
            description=tool_config["description"],
            input_schema=tool_config["input_schema"],
            handler=tool_config["handler"]
        )
        self.tool_registry.register_tool(tool)
        
    def register_request_handler(
        self, 
        method: str, 
        handler: Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]
    ) -> None:
        self._request_handlers[method] = handler
        
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(request, dict):
            raise MCPError(
                ErrorCode.INVALID_REQUEST, 
                "Request must be a JSON object"
            )
            
        method = request.get("method")
        if not method:
            raise MCPError(
                ErrorCode.INVALID_REQUEST, 
                "Request missing 'method' field"
            )
            
        handler = self._request_handlers.get(method)
        if handler:
            return await handler(request)
            
        # Default handlers for standard MCP methods
        if method == RequestMethod.LIST_TOOLS:
            return {"tools": self.tool_registry.list_tools()}
            
        elif method == RequestMethod.CALL_TOOL:
            name = request.get("name")
            parameters = request.get("parameters", {})
            
            if not name:
                raise MCPError(
                    ErrorCode.INVALID_REQUEST, 
                    "Call tool request missing 'name' field"
                )
                
            return await self.tool_registry.call_tool(name, parameters)
            
        elif method == RequestMethod.GET_CONTEXT:
            context_id = request.get("context_id")
            
            if not context_id:
                raise MCPError(
                    ErrorCode.INVALID_REQUEST, 
                    "Get context request missing 'context_id' field"
                )
                
            context = self.context_manager.get_context(context_id)
            return {"context": context or {}}
            
        elif method == RequestMethod.SET_CONTEXT:
            context_id = request.get("context_id")
            data = request.get("data")
            
            if not context_id:
                raise MCPError(
                    ErrorCode.INVALID_REQUEST, 
                    "Set context request missing 'context_id' field"
                )
                
            if not isinstance(data, dict):
                raise MCPError(
                    ErrorCode.INVALID_REQUEST, 
                    "Set context request 'data' must be a JSON object"
                )
                
            success = self.context_manager.set_context(context_id, data)
            return {"success": success}
            
        else:
            raise MCPError(
                ErrorCode.INVALID_REQUEST, 
                f"Unknown method: {method}"
            )
            
    def set_transport(self, transport: BaseTransport) -> None:
        self.transport = transport
        transport.set_request_handler(self.handle_request)
        
    async def start(self) -> None:
        if not self.transport:
            raise ValueError("Transport not set")
            
        logger.info(f"Starting MCP server {self.name} v{self.version}")
        try:
            await self.transport.start()
        except Exception as e:
            logger.error(f"Error starting server: {str(e)}")
            raise
            
    async def stop(self) -> None:
        if self.transport:
            await self.transport.stop()`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 11: Create the Main Entry Point</h2>
            <p className="mb-4">
              Finally, let's create the main entry point for our application. Create <code>main.py</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# main.py
import asyncio
import logging
import signal
from server import MCPServer
from mcp.transport import StdioTransport, HttpTransport
from tools.weather import weather_tool
from tools.calculator import calculator_tool
import config

logger = logging.getLogger(__name__)

async def main():
    # Create the MCP server
    server = MCPServer(config.SERVER_CONFIG)
    
    # Register tools
    server.register_tool(weather_tool)
    server.register_tool(calculator_tool)
    
    # Set up transport based on configuration
    if config.TRANSPORT_TYPE.lower() == "stdio":
        transport = StdioTransport()
    else:  # "http"
        transport = HttpTransport(
            host=config.HTTP_HOST,
            port=config.HTTP_PORT
        )
        
    server.set_transport(transport)
    
    # Set up signal handling for graceful shutdown
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(shutdown(server)))
    
    try:
        # Start the server
        await server.start()
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        await shutdown(server)

async def shutdown(server):
    logger.info("Shutting down server...")
    await server.stop()
    
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}")
        exit(1)`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 12: Run Your MCP Server</h2>
            <p className="mb-4">
              Now that you've implemented your Python MCP server, it's time to run it:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# Make sure you're in your virtual environment
python main.py`}</code>
            </pre>

            <p className="mb-4">
              Your MCP server will start running with the configured transport (stdio by default). To use the HTTP transport, just update the <code>TRANSPORT_TYPE</code> in your <code>.env</code> file.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">Testing Your MCP Server</h2>
            <p className="mb-4">
              You can test your HTTP-based MCP server using curl:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# List available tools
curl -X POST http://localhost:8000/ \\
  -H "Content-Type: application/json" \\
  -d '{"method": "list_tools"}'

# Call the weather tool
curl -X POST http://localhost:8000/ \\
  -H "Content-Type: application/json" \\
  -d '{"method": "call_tool", "name": "get_weather", "parameters": {"location": "New York"}}'

# Call the calculator tool
curl -X POST http://localhost:8000/ \\
  -H "Content-Type: application/json" \\
  -d '{"method": "call_tool", "name": "calculate", "parameters": {"expression": "2 + 2 * 3"}}'`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Integrating with AI Libraries</h2>
            <p className="mb-4">
              One of Python's greatest strengths is its rich ecosystem of AI and machine learning libraries. Let's look at how you can extend your MCP server with AI capabilities:
            </p>

            <div className="bg-muted p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-4">Integration Examples</h3>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <strong>Natural Language Processing with spaCy or NLTK</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add text analysis tools that can extract entities, sentiment, or summarize text.
                  </p>
                </li>
                <li>
                  <strong>Machine Learning with scikit-learn or PyTorch</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create tools that classify data, make predictions, or detect anomalies.
                  </p>
                </li>
                <li>
                  <strong>Data Analysis with pandas</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Implement tools for data transformation, filtering, or statistical analysis.
                  </p>
                </li>
                <li>
                  <strong>Image Processing with Pillow or OpenCV</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add tools for image manipulation, OCR, or computer vision tasks.
                  </p>
                </li>
              </ol>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg my-8 border border-primary/20">
              <h3 className="text-xl font-semibold mb-4 text-primary">Advanced Implementation Topics</h3>
              <p className="mb-4">
                This guide covered a basic implementation. For production use, consider these enhancements:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Implement a database backend for context storage (PostgreSQL, MongoDB, Redis)</li>
                <li>Add authentication and authorization using OAuth, JWT, or API keys</li>
                <li>Implement rate limiting and security measures with middleware</li>
                <li>Containerize your application with Docker for easier deployment</li>
                <li>Set up CI/CD pipelines for automated testing and deployment</li>
                <li>Add comprehensive logging and monitoring with tools like Prometheus and Grafana</li>
              </ul>
            </div>

            <div className="flex justify-between items-center mt-12 pt-6 border-t">
              <Link href="/servers/implementation">
                <Button variant="outline">
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Back to Implementations
                </Button>
              </Link>
              <Link href="/playground">
                <Button>
                  Try in Playground <Code className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 