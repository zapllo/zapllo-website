import connectDB from "@/lib/db";
import User from "@/models/userModel";
import Organization from "@/models/organizationModel";
import Category from "@/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Leave from "@/models/leaveTypeModel";
import { Types } from "mongoose";

connectDB();


const sendWebhookNotification = async (phoneNumber: string, templateName: string, mediaUrl: string, bodyVariables: string[]) => {
  const payload = {
    phoneNumber,
    bodyVariables,
    templateName,
    mediaUrl,
  };

  try {
    const response = await fetch('https://zapllo.com/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(`Webhook API error: ${responseData.message}`);
    }
    console.log('Webhook notification sent successfully:', payload);
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    throw new Error('Failed to send webhook notification');
  }
};


// Function to initialize leave balances for a newly created user
async function initializeLeaveBalancesForNewUser(userId: string, organizationId: string) {
  const leaveTypes = await Leave.find({ organization: organizationId });

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.leaveBalances) {
    user.leaveBalances = [];
  }

  for (const leaveType of leaveTypes) {
    const existingBalance = user.leaveBalances.find(balance =>
      balance.leaveType && balance.leaveType.equals(leaveType._id as string)
    );

    if (!existingBalance) {
      user.leaveBalances.push({
        leaveType: leaveType._id as unknown as Types.ObjectId,
        balance: leaveType.allotedLeaves,
      });
    }
  }

  await user.save();
}


export async function POST(request: NextRequest) {
  try {
    let authenticatedUser = null;
    let userId: string | null = null;

    // Try to retrieve the token if present
    try {
      userId = await getDataFromToken(request);
      if (userId) {
        authenticatedUser = await User.findById(userId);
        if (!authenticatedUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
      }
    } catch (err: any) {
      console.log('No token provided or error retrieving token:', err.message);
    }

    const reqBody = await request.json();
    const {
      whatsappNo,
      email,
      password,
      companyName,
      industry,
      teamSize,
      description,
      role,
      categories = [], // Default to empty array if not provided
      reportingManagerId,
    } = reqBody;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash the password using bcryptjs
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create trial expiration date
    const trialDays = 7;
    const trialExpires = new Date();
    trialExpires.setDate(trialExpires.getDate() + trialDays);

    const formatDate = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
      return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };


    // Determine the role of the new user
    let newUserRole = "member";
    let newOrganizationId: string | null = null;

    if (authenticatedUser) {
      if (authenticatedUser.role === "orgAdmin") {
        newUserRole = role || "member";
        newOrganizationId = authenticatedUser.organization ? authenticatedUser.organization.toString() : null;
      }
    } else {
      newUserRole = "orgAdmin"; // Default role for new users signing up
    }

    // Initialize user creation object
    const newUser = new User({
      whatsappNo,
      firstName: reqBody.firstName,
      lastName: reqBody.lastName,
      email,
      password: hashedPassword,
      trialExpires,
      role: newUserRole,
      organization: newOrganizationId,
      reportingManager: reportingManagerId || null, // Assign reporting manager
    });

    let savedOrganization = null;

    if (companyName && industry && teamSize && description && categories.length > 0) {
      // Create a temporary organization without categories
      const tempOrganization = new Organization({
        companyName,
        industry,
        teamSize,
        description,
        trialExpires,
      });

      const savedTempOrganization = await tempOrganization.save();

      // Create categories and associate them with the temporary organization
      const createdCategories = await Promise.all(
        categories.map(async (categoryName: string) => {
          let category = await Category.findOne({ name: categoryName });
          if (!category) {
            category = new Category({
              name: categoryName,
              organization: savedTempOrganization._id, // Associate with temp organization
            });
            await category.save();
          } else {
            // Update existing categories with the temp organization ID
            category.organization = savedTempOrganization._id;
            await category.save();
          }
          return category._id;
        })
      );

      // Update the temp organization with categories
      savedTempOrganization.categories = createdCategories;
      const savedOrganization = await savedTempOrganization.save();

      // Finalize the new user with the organization ID
      newUser.organization = savedOrganization._id;
      newUser.isAdmin = true;
    }

    const savedUser = await newUser.save();
    const organization = await Organization.findById(savedUser.organization);

    const formattedTrialExpires = formatDate(trialExpires);

    // Determine the template based on the user creation context
    let templateName;
    let bodyVariables: string[];

    if (authenticatedUser) {
      templateName = 'loginsuccessmember'; // Template for new member
      bodyVariables = [savedUser.firstName, authenticatedUser.firstName, organization.companyName, email, password];
    } else {
      templateName = 'loginsuccessadmin'; // Template for new orgAdmin
      bodyVariables = [savedUser.firstName, organization.companyName]; // Different body variables
    }

    let emailSubject;
    let emailText;
    let emailHtml;

    if (authenticatedUser) {
      templateName = 'loginsuccessmember'; // Template for new member
      emailSubject = `Business Workspace Invitation to Team - ${organization.companyName}!`;
      emailText = `Dear ${reqBody.firstName},\n\nYou've been added to ${organization.companyName} on Zapllo! ...`;
      emailHtml = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
            <div style="background-color: #74517A; color: #ffffff; padding: 10px; font-size: 12px;  text-align: center;">
                <h1 style="margin: 0;">Welcome to Team - ${organization.companyName}!</h1>
            </div>
            <div style="padding: 20px;">
                <p>We are excited to have you on board. Here are your account details:</p>
                <p><strong>First Name:</strong> ${reqBody.firstName}</p>
                <p><strong>Last Name:</strong>${reqBody.lastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #1a73e8;">${email}</a></p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>WhatsApp Number:</strong> ${whatsappNo}</p>
                <p><strong>Role:</strong> ${newUserRole}</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://zapllo.com/login" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Here</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
            </div>
        </div>
    </div>
</body>`;
    } else {
      templateName = 'loginsuccessadmin'; // Template for new orgAdmin
      emailSubject = `Business Workspace Creation for Team - ${organization.companyName}!`;
      emailText = `Dear ${reqBody.firstName},\n\nThank you for signing up at Zapllo! ...`;
      emailHtml = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="background-color: #f0f4f8; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding: 20px;">
                  <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
              </div>
              <div style="background-color: #74517A; color: #ffffff; padding: 20px;  font-size: 12px; text-align: center;">
                  <h1 style="margin: 0;">New Workspace Created</h1>
              </div>
              <div style="padding: 20px;">
                  <p><strong>Dear ${reqBody.firstName},</strong></p>
                  <p>You have created your Workspace - ${organization.companyName}</p>
                  <p>We have started a FREE Trial for your account which is valid till ${formattedTrialExpires}</p>
                  <p>In the trial period you can invite upto 5 team members to try out how the app works.</p>
                  <p>Login to the app now and start Delegating Now!</p>
                  <div style="text-align: center;  margin-top: 20px;">
                      <a href="https://zapllo.com/login" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Here</a>
                  </div>
                  <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
              </div>
          </div>
      </div>
  </body>`;

    }
    // Send the email
    const emailOptions: SendEmailOptions = {
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    };

    await sendEmail(emailOptions);

    if (!authenticatedUser) {
      let emailSubject;
      let emailText;
      let emailHtml;

      emailSubject = `Business Workspace Invitation to Team - ${organization.companyName}!`;
      emailText = `Dear ${reqBody.firstName},\n\nYou've been added to ${organization.companyName} on Zapllo! ...`;
      emailHtml = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
            <div style="background-color: #74517A; color: #ffffff; padding: 10px; font-size: 12px;  text-align: center;">
                <h1 style="margin: 0;">Welcome to Team - ${organization.companyName}!</h1>
            </div>
            <div style="padding: 20px;">
                <p>We are excited to have you on board. Here are your account details:</p>
                <p><strong>First Name:</strong> ${reqBody.firstName}</p>
                <p><strong>Last Name:</strong>${reqBody.lastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #1a73e8;">${email}</a></p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>WhatsApp Number:</strong> ${whatsappNo}</p>
                <p><strong>Role:</strong> ${newUserRole}</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://zapllo.com/login" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Here</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
            </div>
        </div>
    </div>
</body>`;
      // Only send the second email if it's a new admin
      const credentialsEmailOptions: SendEmailOptions = {
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      };

      await sendEmail(credentialsEmailOptions);
    }

    // Send the WhatsApp notification
    const mediaUrl = "https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/d262fa42-63b2-417e-83f2-87871d3474ff/message_template_media/w4B2cSkUyaf3/logo-02%204.png?se=2029-07-07T15%3A30%3A43Z&sp=rt&sv=2019-12-12&sr=b&sig=EtEFkVbZXLeBLJ%2B9pkZitby/%2BwJ4HzJkGgeT2%2BapgoQ%3D";
    // await sendWebhookNotification(whatsappNo, templateName, mediaUrl, bodyVariables);
    if (newOrganizationId && savedUser._id) {
      await initializeLeaveBalancesForNewUser(savedUser._id.toString(), newOrganizationId);
    }

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      user: savedUser,
      organization: savedOrganization,
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
