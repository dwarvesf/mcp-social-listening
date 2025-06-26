/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import {
  readProfileDB,
  readProfileDBV2,
  writeParquetData,
} from '../db/utils.js';
import { MemberType } from '../type.js';
import StorageUtil from '../storage.js';

export function addDescribeParquetTool(server: FastMCP) {
  server.addTool({
    name: 'list_usernames_from_contributors',
    description: 'Lists all usernames from the contributors Parquet file.',
    execute: async () => {
      try {
        const result = await readProfileDB('SELECT username from Profiles');
        return JSON.stringify(result, null, 2);
      } catch (error: any) {
        return `Failed to describe Parquet table: ${error.message}`;
      }
    },
  });

  server.addTool({
    name: 'add_member_type_for_contributors',
    description: 'Adds a member type for contributors in the Parquet file.',
    parameters: z.object({
      member_usernames: z
        .array(z.string())
        .describe('List of member usernames'),
      type: z
        .nativeEnum(MemberType)
        .describe(
          'The type of member to add (e.g., "contributor", "maintainer", "admin").',
        ),
    }),
    execute: async args => {
      const { member_usernames, type } = args;

      try {
        const profiles = await readProfileDBV2();
        let hasUpdated = false;
        const updatedProfiles = profiles.map((profile: Record<string, any>) => {
          if (member_usernames.includes(profile.username)) {
            hasUpdated = true;
            return { ...profile, member_type: type };
          }
          return profile;
        });

        if (!hasUpdated) {
          return `No profiles found for the provided usernames: ${JSON.stringify(member_usernames)}`;
        }

        const dataBuffer = await writeParquetData(updatedProfiles);

        const storage = new StorageUtil();
        await storage.storeData(dataBuffer, 'profiles/contributors.parquet');

        return `Successfully updated member types for ${JSON.stringify(profiles[0])} users.`;
      } catch (error: any) {
        return `Failed to update member types: ${error.message}`;
      }
    },
  });
}
