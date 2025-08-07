/* eslint-disable @typescript-eslint/no-explicit-any */
import { DuckDBInstance } from '@duckdb/node-api';
import StorageUtil from '../storage.js';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { PassThrough } from 'stream';
import parquet from 'parquetjs-lite';

// Create a map to store DuckDB instances by file path
const duckdbInstances: Map<string, DuckDBInstance> = new Map();

/**
 * Execute a SQL query against a DuckDB database using the specified parquet file
 *
 * @param sql The SQL query to execute
 * @param filePath The path to the parquet file
 * @returns The query result as an array of objects
 */

export async function queryDuckDB<D extends Record<string, any>>(
  sql: string,
  options: { filePath: string; tableName: string },
) {
  const filePath = options.filePath;
  const tableName = options.tableName;

  try {
    // Path to the parquet file

    // Create or reuse a DuckDB instance for the given file path
    if (!duckdbInstances.has(filePath)) {
      const instance = await DuckDBInstance.create(':memory:');
      duckdbInstances.set(filePath, instance);
    }

    const duckdbInstance = duckdbInstances.get(filePath);

    if (!duckdbInstance) {
      throw new Error('Failed to retrieve DuckDB instance.');
    }

    // Create connection
    const connection = await duckdbInstance.connect();

    // Register the parquet file as a table
    await connection.run(
      `CREATE VIEW IF NOT EXISTS ${tableName} AS SELECT * FROM parquet_scan('${filePath}');`,
    );

    // Execute the query and get all results at once
    const result = await connection.runAndReadAll(sql);

    // Convert result to JSON compatible format for easier handling
    const jsonData = (await result.getRowObjectsJson()) as D[];

    // Close only the connection, keeping the instance for future queries
    await connection.closeSync();
    return jsonData;
  } catch (error) {
    console.error('Error executing DuckDB query:', error);
    throw error;
  }
}

export async function readProfileDB(sql: string): Promise<any> {
  const PROFILE_PATH = 'profiles/contributors.parquet';
  const storage = new StorageUtil();
  const parquetBuffer = await storage.readData(PROFILE_PATH);
  if (!parquetBuffer) {
    throw new Error(`Failed to read Parquet file from GCS: ${PROFILE_PATH}`);
  }
  console.log(
    `Read Parquet file from GCS: ${PROFILE_PATH}, size: ${parquetBuffer.length} bytes`,
  );

  // Open the Parquet buffer directly with DuckDB

  let tempFilePath: string | undefined;

  try {
    // Create a temporary file to write the parquet buffer
    tempFilePath = path.join(os.tmpdir(), `temp_parquet_${Date.now()}.parquet`);
    await fs.writeFile(tempFilePath, parquetBuffer);

    const result = await queryDuckDB(sql, {
      filePath: tempFilePath,
      tableName: 'Profiles',
    });

    return result;
  } finally {
    if (tempFilePath) {
      await fs
        .unlink(tempFilePath)
        .catch(e =>
          console.error(`Error deleting temporary file ${tempFilePath}:`, e),
        );
    }
  }
}

export async function readProfileDBV2(): Promise<any> {
  const PROFILE_PATH = 'profiles/contributors.parquet';
  const storage = new StorageUtil();
  const parquetBuffer = await storage.readData(PROFILE_PATH);
  if (!parquetBuffer) {
    throw new Error(`Failed to read Parquet file from GCS: ${PROFILE_PATH}`);
  }
  console.log(
    `Read Parquet file from GCS: ${PROFILE_PATH}, size: ${parquetBuffer.length} bytes`,
  );

  let tempFilePath: string | undefined;

  try {
    // Create a temporary file to write the parquet buffer
    tempFilePath = path.join(
      os.tmpdir(),
      `temp_parquet_v2_${Date.now()}.parquet`,
    );
    await fs.writeFile(tempFilePath, parquetBuffer);

    const result = await queryDuckDB('SELECT * FROM Profiles;', {
      filePath: tempFilePath,
      tableName: 'Profiles',
    });

    return result;
  } finally {
    if (tempFilePath) {
      await fs
        .unlink(tempFilePath)
        .catch(e =>
          console.error(`Error deleting temporary file ${tempFilePath}:`, e),
        );
    }
  }
}

export async function writeParquetData(
  data: Array<Record<string, any>>,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const stream = new PassThrough();
  stream.on('data', (chunk: Buffer) => chunks.push(chunk));

  const schema = new parquet.ParquetSchema({
    profile_url: { type: 'UTF8', optional: true },
    username: { type: 'UTF8', optional: true },
    member_type: { type: 'UTF8', optional: true },
    github_url: { type: 'UTF8', optional: true },
    linkedin_url: { type: 'UTF8', optional: true },
    discord_usernames: { type: 'UTF8', optional: true },
    analysis_result: { type: 'UTF8', optional: true },
    github_crawl_status: { type: 'UTF8', optional: true },
    last_attempted_at: { type: 'UTF8', optional: true },
    github_extraction_error: { type: 'UTF8', optional: true },
    github_crawled_at: { type: 'UTF8', optional: true },
    github_metadata: { type: 'UTF8', optional: true },
    linkedin_crawl_status: { type: 'UTF8', optional: true },
    last_crawled_at: { type: 'UTF8', optional: true },
    linkedin_metadata: { type: 'UTF8', optional: true },
    facebook_url: { type: 'UTF8', optional: true },
    mochi: { type: 'UTF8', optional: true },
    mochi_profile_crawl_status: { type: 'UTF8', optional: true },
    mochi_profile_metadata: { type: 'UTF8', optional: true },
  });

  const writer = await parquet.ParquetWriter.openStream(schema, stream);
  for (const item of data) {
    await writer.appendRow(item);
  }
  await writer.close();

  await new Promise<void>(resolve => stream.end(() => resolve()));
  const fileBuffer: Buffer = Buffer.concat(chunks);

  return fileBuffer;
}
