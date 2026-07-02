import { NextResponse } from 'next/server';

const CLIENT_PASSWORD = process.env.CLIENT_PASSWORD || 'client123';

const bankDetails = {
  bankName: "Dutch Bangla Bank",
  acNumber: "1201580374514",
  firstName: "MST POLY",
  lastName: "KHATUN",
  swiftCode: "DBBLBDDH",
  branchCode: "120",
  routingNo: "090471544",
  country: "Bangladesh",
  city: "Khulna",
  postcode: "9000",
  branch: "Khulna",
  email: "minzu.bd.123@gmail.com",
  address: "Holding 26,1, Road Goyalkhali, Boyra, Stamp Khulna GPO"
};

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (password === CLIENT_PASSWORD) {
      return NextResponse.json({
        success: true,
        data: bankDetails
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: "Incorrect password"
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Invalid request"
    }, { status: 400 });
  }
}
