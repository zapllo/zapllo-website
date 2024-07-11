import connectDB from "@/lib/db";
import User from "@/models/userModel";
import Organization from "@/models/organizationModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";
import { getDataFromToken } from "@/helper/getDataFromToken";

connectDB();

export async function POST(request: NextRequest) {
  try {

    const userId = await getDataFromToken(request);
    // Find the authenticated user in the database based on the user ID
    const authenticatedUser = await User.findById(userId);
    if (!authenticatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reqBody = await request.json();
    const {
      whatsappNo,
      email,
      password,
      organization,
      firstName,
      lastName,
      companyName,
      industry,
      teamSize,
      description,
      categories,
    } = reqBody;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password using bcryptjs
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create trial expiration date
    const trialDays = 7;
    const trialExpires = new Date();
    trialExpires.setDate(trialExpires.getDate() + trialDays);

    // Initialize user creation object
    const newUser = new User({
      whatsappNo,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      trialExpires,
      role: "orgAdmin", // Set the initial role to 'orgAdmin' for the creator
      organization: authenticatedUser.organization,
    });

    // Initialize variable for organization
    let savedOrganization = null;

    // Conditionally create the organization if organization fields are provided
    if (companyName && industry && teamSize && description && categories) {
      const newOrganization = new Organization({
        companyName,
        industry,
        teamSize,
        description,
        categories: categories.toString(),
        users: [newUser._id], // Associate the new user with this organization
        trialExpires,
      });

      // Save the new organization
      savedOrganization = await newOrganization.save();

      // Associate the user with the organization
      newUser.organization = savedOrganization._id;
      newUser.isAdmin = true;
    }

    // Save the new user
    const savedUser = await newUser.save();

    // Send a welcome email
    const emailOptions: SendEmailOptions = {
      to: email,
      subject: "Thanks for registering at Zapllo!",
      text: `Dear ${firstName},\n\nThank you for reaching out to Zapllo! We are thrilled to hear from you and appreciate your interest in our services. Our team is already on it, and you can expect to hear back from us within the next 24 hours.Whether it is about our custom Notion systems, automation solutions, or business workflow consultation, we are here to help you achieve your goals with innovative and powerful solutions. In the meantime, feel free to explore our website to learn more about what we offer and how we can assist you.\n\nThanks & Regards\nTeam Zapllo`,
      html: `<h1>Thank You! </h1>
        `,
    };

    await sendEmail(emailOptions);

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      user: savedUser,
      organization: savedOrganization,
    });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
