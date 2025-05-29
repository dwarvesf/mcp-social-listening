import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

import { Source } from './type';

config();

export class SupabaseUtils {
  private supabase: SupabaseClient;

  constructor() {
    // Initialization will be handled by the public init() method
    this.supabase = this._initializeSupabase();
  }

  public async addSource(
    source: Pick<Source, 'name' | 'platform' | 'type' | 'url'>,
  ): Promise<Source> {
    const { data, error } = await this.supabase
      .from('Source')
      .insert(source)
      .select();

    if (error) {
      console.error('Error adding source:', error);
      throw error;
    }

    return data[0] as Source;
  }

  private _initializeSupabase(): SupabaseClient {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase URL or Key is not defined in environment variables.',
      );
    }
    return createClient(supabaseUrl, supabaseKey);
  }
}

export const supabaseUtils = new SupabaseUtils();
