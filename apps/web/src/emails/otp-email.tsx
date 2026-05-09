import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

type OtpEmailProps = {
	code: string;
};

export function OtpEmail({ code }: OtpEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Your Miru verification code: {code}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={brand}>Miru</Heading>
					<Text style={paragraph}>
						Use the code below to sign in. It expires in 5 minutes.
					</Text>
					<Section style={codeBox}>
						<Text style={codeText}>{code}</Text>
					</Section>
					<Text style={footer}>
						If you didn't request this code, you can safely ignore this email.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

OtpEmail.PreviewProps = { code: "123456" } satisfies OtpEmailProps;

export default OtpEmail;

const body = {
	backgroundColor: "#f5f5f5",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	margin: 0,
	padding: "40px 0",
} as const;

const container = {
	backgroundColor: "#ffffff",
	borderRadius: "12px",
	margin: "0 auto",
	maxWidth: "440px",
	padding: "40px 32px",
} as const;

const brand = {
	color: "#0a0a0a",
	fontSize: "28px",
	fontWeight: 700,
	letterSpacing: "-0.5px",
	margin: "0 0 24px",
	textAlign: "center" as const,
};

const paragraph = {
	color: "#404040",
	fontSize: "15px",
	lineHeight: "22px",
	margin: "0 0 24px",
	textAlign: "center" as const,
};

const codeBox = {
	backgroundColor: "#fafafa",
	border: "1px solid #e5e5e5",
	borderRadius: "8px",
	padding: "20px",
	textAlign: "center" as const,
};

const codeText = {
	color: "#0a0a0a",
	fontFamily:
		'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
	fontSize: "32px",
	fontWeight: 600,
	letterSpacing: "8px",
	margin: 0,
};

const footer = {
	color: "#737373",
	fontSize: "13px",
	lineHeight: "18px",
	margin: "32px 0 0",
	textAlign: "center" as const,
};
