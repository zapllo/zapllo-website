import React from "react";

interface IconProps {
  className?: string;
}

export const Icons: { [key: string]: React.FC<IconProps> } = {
  googleDrive: ({ className }) => (
    <img
      className={className}
      src="/googleDrive.png"
      alt="Google Drive"
    />
  ),
  discord: ({ className }) => (
    <img
      className={className}
      src="/discord.png"
      alt="Discord"
    />
  ),
  whatsapp: ({ className }) => (
    <img
      className={className}
      src="/whatsapp.png"
      alt="WhatsApp"
    />
  ),
  notion: ({ className }) => (
    <img
      className={className}
      src="/notion.png"
      alt="Notion"
    />
  ),
  slack: ({ className }) => (
    <img
      className={className}
      src="/slack.png"
      alt="Slack"
    />
  ),
  zapllo: ({ className }) => (
    <img
      className={className}
      src="/logoonly.png"
      alt="Zapllo"
    />
  ),
  user: ({ className }) => (
    <img
      className={className}
      src="/logo.png"
      alt="User"
    />
  ),
};
