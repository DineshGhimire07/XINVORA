"use client"

import { useState } from "react"
import { changePasswordAction } from "@/actions/security.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Stack } from "@/components/shared/stack"

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      setLoading(false)
      return
    }

    const result = await changePasswordAction({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    if (result.success) {
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setError(result.error?.message || "Failed to change password.")
    }
    setLoading(false)
  }

  return (
    <Card className="rounded-none border-border-primary/40 shadow-sm">
      <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50">
        <CardTitle className="text-xs font-light tracking-widest uppercase">Change Password</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              Password updated successfully!
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="rounded-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="rounded-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 rounded-none uppercase tracking-widest text-[11px] font-semibold"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
