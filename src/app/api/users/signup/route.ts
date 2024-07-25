import connectDB from "@/lib/db";
import User from "@/models/userModel";
import Organization from "@/models/organizationModel";
import Category from "@/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";
import { getDataFromToken } from "@/helper/getDataFromToken";

connectDB();

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
        newOrganizationId = authenticatedUser.organization;
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

    const emailOptions: SendEmailOptions = {
      to: email,
      subject: "Thanks for registering at Zapllo!",
      text: `Dear ${reqBody.firstName},\n\nThank you for reaching out to Zapllo! ...`,
      html: `<h1>Thank You!</h1>`,
    };

    await sendEmail(emailOptions);

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
