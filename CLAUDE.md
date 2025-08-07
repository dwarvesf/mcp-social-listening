# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Run

- **Build**: `pnpm build` - Compiles TypeScript to JavaScript with proper executable permissions
- **Start**: `pnpm start` - Runs the compiled server using tsx
- **Development**: `pnpm dev` - Runs the server in development mode with fastmcp dev

### Code Quality

- **Lint**: `pnpm lint` - Runs prettier check, eslint, and TypeScript type checking
- **Format**: `pnpm format` - Auto-formats code with prettier and fixes eslint issues
- **Test**: `pnpm test` - Runs the vitest test suite

### Testing Individual Components

- Run specific test file: `pnpm test src/lib/facebook.test.ts`
- Run tests in watch mode: `pnpm test --watch`

## High-Level Architecture

This is a Model Context Protocol (MCP) server for social listening that provides tools to add and manage social media resources. The system follows a modular architecture:

### Core Components

1. **MCP Server Entry** (`src/index.ts`): FastMCP server that registers tools and resources. The server runs via stdio for communication with MCP clients.

2. **Tool System** (`src/tools/`):

   - `source.ts`: Handles adding new social media sources (RSS, YouTube, X/Twitter, Reddit, Facebook, newsletters)
   - `profile.ts`: Manages user profiles stored in Parquet format with social media URLs

3. **Platform Parsers** (`src/lib/`): Each social platform has its own parser module that:

   - Validates URLs for the specific platform
   - Extracts metadata and source information
   - Returns standardized `SubmitSource` objects

4. **Data Storage**:

   - **Supabase** (`src/supabase.ts`): Stores social media sources in PostgreSQL
   - **Parquet Files** (`src/db/utils.ts`): Profile data stored in columnar format using DuckDB
   - **Cloud Storage** (`src/storage.ts`): Handles file uploads to Google Cloud Storage

5. **Type System** (`src/type.ts`): Defines enums and interfaces for:
   - Categories (AI, Blockchain, Design, etc.)
   - Platforms (YouTube, Reddit, X, etc.)
   - Regions (US, EU, Asia, etc.)
   - Source types and processing status

### Data Flow

1. User provides URL via MCP tool → Platform parser validates and extracts data → Supabase stores the source
2. Profile management: Read from Parquet → Modify in memory → Write back to Parquet → Upload to cloud storage

### Environment Requirements

The server requires:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key
- Google Cloud credentials for storage operations

### Key Design Patterns

- **Factory Pattern**: URL type detection dispatches to appropriate parser
- **Repository Pattern**: Separate storage utilities for different backends
- **Type Safety**: Zod schemas validate tool inputs, TypeScript ensures type safety throughout
