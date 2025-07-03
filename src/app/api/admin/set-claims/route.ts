import { NextRequest, NextResponse } from 'next/server';
import { setAdminClaim, verifyAndGetUser } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { idToken, targetUid, isAdmin } = await request.json();

    if (!idToken || !targetUid) {
      return NextResponse.json(
        { error: 'Missing required fields: idToken and targetUid' },
        { status: 400 }
      );
    }

    // Verify the requesting user's token
    const decodedToken = await verifyAndGetUser(idToken);
    
    // Check if the requesting user is already an admin
    const isRequestingUserAdmin = decodedToken.admin === true;
    
    if (!isRequestingUserAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only existing admins can set admin claims' },
        { status: 403 }
      );
    }

    // Verify the requesting user is from @kyanhealth.com domain
    if (!decodedToken.email?.endsWith('@kyanhealth.com')) {
      return NextResponse.json(
        { error: 'Unauthorized: Only @kyanhealth.com users can set admin claims' },
        { status: 403 }
      );
    }

    // Set the admin claim for the target user
    await setAdminClaim(targetUid, isAdmin ?? true);

    return NextResponse.json({
      success: true,
      message: `Admin claim ${isAdmin ? 'granted' : 'revoked'} for user ${targetUid}`,
    });

  } catch (error) {
    console.error('Error in set-claims API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}