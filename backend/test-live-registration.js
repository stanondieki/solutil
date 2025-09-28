// Script to register multiple test users and verify Firebase Auth integration
require('dotenv').config();
const axios = require('axios').default;
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const baseURL = 'http://localhost:5000';

async function registerTestUser(name, email, userType = 'client') {
  try {
    console.log(`📝 Registering: ${name} (${email})`);
    
    const response = await axios.post(`${baseURL}/api/auth/register`, {
      name,
      email,
      password: 'password123',
      userType,
      phone: '+1234567890'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      console.log(`✅ Registration successful for ${email}`);
      console.log(`   🆔 UID: ${response.data.data.user.firebaseAuthId}`);
      return response.data.data.user.firebaseAuthId;
    } else {
      console.log(`❌ Registration failed for ${email}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error registering ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function verifyFirebaseAuthUser(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    console.log(`   ✅ Verified in Firebase Auth: ${user.email}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Not found in Firebase Auth: ${error.message}`);
    return false;
  }
}

async function listAllFirebaseUsers() {
  try {
    console.log('\n🔍 Current Firebase Authentication Users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const listUsersResult = await admin.auth().listUsers(1000);
    const users = listUsersResult.users;
    
    if (users.length === 0) {
      console.log('❌ No users found in Firebase Authentication');
    } else {
      console.log(`✅ Found ${users.length} users in Firebase Authentication:`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.displayName || 'No Name'} (${user.email})`);
        console.log(`   🆔 UID: ${user.uid}`);
        console.log(`   ✉️  Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${new Date(user.metadata.creationTime).toLocaleString()}`);
        console.log('   ─────────────────────────────────────');
      });
    }
    
    return users.length;
  } catch (error) {
    console.error('❌ Error listing Firebase users:', error.message);
    return 0;
  }
}

async function main() {
  console.log('🚀 Testing Live User Registration → Firebase Authentication');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Check initial state
  const initialCount = await listAllFirebaseUsers();
  
  console.log('\n📝 Registering New Test Users...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Register test users
  const testUsers = [
    { name: 'Live Test User 1', email: 'livetest1@example.com', type: 'client' },
    { name: 'Live Test User 2', email: 'livetest2@example.com', type: 'provider' },
    { name: 'Live Test User 3', email: 'livetest3@example.com', type: 'client' }
  ];
  
  const registeredUIDs = [];
  
  for (const user of testUsers) {
    const uid = await registerTestUser(user.name, user.email, user.type);
    if (uid) {
      registeredUIDs.push(uid);
      // Verify immediately after registration
      await verifyFirebaseAuthUser(uid);
    }
    console.log(''); // Empty line for readability
  }
  
  // Wait a moment for Firebase to sync
  console.log('⏳ Waiting 2 seconds for Firebase sync...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check final state
  console.log('\n🔍 Final Firebase Authentication State:');
  const finalCount = await listAllFirebaseUsers();
  
  console.log('\n📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👥 Initial users: ${initialCount}`);
  console.log(`📝 Attempted registrations: ${testUsers.length}`);
  console.log(`✅ Successful registrations: ${registeredUIDs.length}`);
  console.log(`👥 Final users: ${finalCount}`);
  console.log(`📈 New users added: ${finalCount - initialCount}`);
  
  if (finalCount > initialCount) {
    console.log('\n🎉 SUCCESS! Users are being added to Firebase Authentication!');
    console.log('🌐 Check your Firebase Console: https://console.firebase.google.com/project/solutil-6ceff/authentication/users');
    console.log('💡 Try refreshing the page if you don\'t see them immediately');
  } else {
    console.log('\n⚠️  No new users were added to Firebase Authentication');
  }
}

main().then(() => {
  console.log('\n🏁 Live registration test completed.');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});