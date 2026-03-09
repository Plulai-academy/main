// lib/email/sender.ts
// Thin wrapper around Resend. All email sending goes through here.
// Handles: env check, from address, reply-to, error logging.

export interface SendEmailOptions {
  to:      string | string[]
  subject: string
  html:    string
  replyTo?: string
  tags?:   { name: string; value: string }[]
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.startsWith('re_your_')) {
    // Dev mode — log instead of sending
    console.info(`[EMAIL DEV] To: ${opts.to} | Subject: ${opts.subject}`)
    console.info(`  → Set RESEND_API_KEY to actually send emails`)
    return { success: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from:     'Plulai <noreply@plulai.com>',
        reply_to: opts.replyTo ?? 'hello@plulai.com',
        to:       Array.isArray(opts.to) ? opts.to : [opts.to],
        subject:  opts.subject,
        html:     opts.html,
        tags:     opts.tags,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[EMAIL] Resend error:', res.status, err)
      return { success: false, error: err }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[EMAIL] Network error:', err.message)
    return { success: false, error: err.message }
  }
}
