import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST - Register interest (public, no auth)
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
        }

        const cleanEmail = email.toLowerCase().trim()

        // Check if already registered
        const { data: existing } = await supabase
            .from("waitlist")
            .select("id")
            .eq("email", cleanEmail)
            .single()

        if (existing) {
            return NextResponse.json(
                { message: "You're already on the list! We'll be in touch soon.", alreadyRegistered: true },
                { status: 200 }
            )
        }

        // Insert new entry
        const { error } = await supabase.from("waitlist").insert({
            email: cleanEmail,
        })

        if (error) {
            console.error("Supabase insert error:", error)
            return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
        }

        // Get total count
        const { count } = await supabase.from("waitlist").select("*", { count: "exact", head: true })

        return NextResponse.json(
            { message: "You're in! We'll notify you when ClearRideAI launches.", count: count || 0 },
            { status: 201 }
        )
    } catch (error) {
        console.error("Waitlist error:", error)
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }
}

// GET - Get waitlist count (public)
export async function GET() {
    try {
        const { count } = await supabase.from("waitlist").select("*", { count: "exact", head: true })
        return NextResponse.json({ count: count || 0 })
    } catch (error) {
        console.error("Waitlist count error:", error)
        return NextResponse.json({ count: 0 })
    }
}
