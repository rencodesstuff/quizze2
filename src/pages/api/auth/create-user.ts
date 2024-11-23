import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, userType, name, studentId, course } = req.body;

    // Start a Supabase transaction
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: userType,
      },
    });

    if (authError) {
      console.error('Auth Error:', authError);
      return res.status(400).json({ message: authError.message });
    }

    if (!authUser.user) {
      return res.status(400).json({ message: 'Failed to create user account' });
    }

    const userId = authUser.user.id;

    try {
      // Check if user role already exists
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingRole) {
        // Add user role only if it doesn't exist
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            id: userId,
            role: userType,
          });

        if (roleError && roleError.code !== '23505') { // Ignore unique constraint violation
          throw roleError;
        }
      }

      // Add user details to the appropriate table
      if (userType === 'student') {
        const { error: studentError } = await supabaseAdmin
          .from('students')
          .insert({
            id: userId,
            name,
            student_id: studentId,
            email,
          });

        if (studentError) {
          // If there's an error, clean up the auth user
          await supabaseAdmin.auth.admin.deleteUser(userId);
          throw studentError;
        }
      } else {
        const { error: teacherError } = await supabaseAdmin
          .from('teachers')
          .insert({
            id: userId,
            name,
            email,
            course,
          });

        if (teacherError) {
          // If there's an error, clean up the auth user
          await supabaseAdmin.auth.admin.deleteUser(userId);
          throw teacherError;
        }
      }

      console.log('User created successfully:', { userId, email, userType });

      return res.status(200).json({ 
        success: true, 
        userId,
        message: 'User created successfully' 
      });

    } catch (error) {
      // If any error occurs during the process, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw error;
    }

  } catch (error: any) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to create user',
      code: error.code
    });
  }
}