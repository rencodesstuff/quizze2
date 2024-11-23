import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variables');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: 'userIds must be an array' });
    }

    // Delete each auth user and their roles
    for (const userId of userIds) {
      // Delete from user_roles first
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('id', userId);

      // Then delete the auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (authError) {
        throw authError;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Users deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting users:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to delete users' 
    });
  }
}