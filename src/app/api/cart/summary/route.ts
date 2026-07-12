import { NextResponse } from "next/server"
import { SessionService } from "@/services/session.service"
import { getHeaderCommerceState } from "@/db/queries/cart"

export async function GET() {
  const { userId, sessionId } = await SessionService.getCommerceIdentity()
  const state = await getHeaderCommerceState(userId, sessionId)
  return NextResponse.json(state)
}
