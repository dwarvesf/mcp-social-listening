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

export function addProfileTools(server: FastMCP) {
  server.addTool({
    name: 'list_usernames_from_profiles',
    description: 'Lists all usernames from the profiles Parquet file.',
    execute: async () => {
      try {
        const result = await readProfileDB('SELECT username from Profiles');
        return result
          .map((profile: Record<string, any>) => profile.username)
          .join(', ');
      } catch (error: any) {
        return `Failed to describe Parquet table: ${error.message}`;
      }
    },
  });

  server.addTool({
    name: 'add_new_profile',
    description: 'Adds a new profile to the Parquet file.',
    parameters: z.object({
      github_url: z.string().describe('GitHub profile URL'),
      linkedin_url: z.string().describe('LinkedIn profile URL').optional(),
      facebook_url: z.string().describe('Facebook profile URL').optional(),
      type: z
        .nativeEnum(MemberType)
        .describe(
          'The type of member to add (e.g., "dwarves", "alumni", "community").',
        ),
    }),
    execute: async args => {
      const { github_url, linkedin_url, facebook_url } = args;

      try {
        const profiles = await readProfileDBV2();
        const newProfile = {
          profile_url: github_url,
          username: github_url.split('/').pop() || '',
          github_url,
          linkedin_url,
          facebook_url,
          member_type: args.type,
        };

        // Check for duplicate profiles
        const existingProfile = profiles.find(
          (profile: Record<string, any>) =>
            profile.github_url === github_url ||
            profile.linkedin_url === linkedin_url ||
            profile.facebook_url === facebook_url,
        );

        if (existingProfile) {
          return `Profile already exists: ${JSON.stringify(existingProfile)}`;
        }

        profiles.push(newProfile);
        const dataBuffer = await writeParquetData(profiles);

        const storage = new StorageUtil();
        await storage.storeData(dataBuffer, 'profiles/contributors.parquet');

        return `Successfully added profile: ${JSON.stringify(newProfile)}`;
      } catch (error: any) {
        return `Failed to add profile: ${error.message}`;
      }
    },
  });

  server.addTool({
    name: 'add_member_type_for_profiles',
    description: 'Adds a member type for profiles in the Parquet file.',
    parameters: z.object({
      member_usernames: z
        .array(z.string())
        .describe('List of member usernames'),
      type: z
        .nativeEnum(MemberType)
        .describe(
          'The type of member to add (e.g., "dwarves", "alumni", "community").',
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
