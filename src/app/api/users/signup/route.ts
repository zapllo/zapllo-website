import connectDB from "@/lib/db";
import User from "@/models/userModel";
import Organization from "@/models/organizationModel";
import Category from "@/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";
import { getDataFromToken } from "@/helper/getDataFromToken";

connectDB();


const sendWebhookNotification = async (phoneNumber: string, templateName: string, mediaUrl: string, firstName: string, organizationName: string) => {
  const payload = {
    phoneNumber,
    bodyVariables: [firstName, organizationName],
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


    const emailOptions: SendEmailOptions = {
      to: email,
      subject: "Thanks for registering at Zapllo!",
      text: `Dear ${reqBody.firstName},\n\nThank you for reaching out to Zapllo! ...`,
      html: `<h1>Thank You!</h1>`,
    };

    await sendEmail(emailOptions);
    const mediaUrl = "https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/d262fa42-63b2-417e-83f2-87871d3474ff/message_template_media/w4B2cSkUyaf3/logo-02%204.png?se=2029-07-07T15%3A30%3A43Z&sp=rt&sv=2019-12-12&sr=b&sig=EtEFkVbZXLeBLJ%2B9pkZitby/%2BwJ4HzJkGgeT2%2BapgoQ%3D";
    const templateName = 'loginsuccessadmin'
    console.log(mediaUrl, templateName, 'media url & template name');
    await sendWebhookNotification(whatsappNo, templateName, mediaUrl, savedUser.firstName, organization.companyName);

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
