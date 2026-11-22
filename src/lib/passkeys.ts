type CredentialID = Omit<PublicKeyCredentialDescriptor, "id"> & { id: string };
export type RegistrationOptions = Omit<PublicKeyCredentialCreationOptions, "challenge" | "user" | "excludeCredentials"> & {
  challenge: string;
  user: Omit<PublicKeyCredentialUserEntity, "id"> & { id: string };
  excludeCredentials?: CredentialID[];
};
export type LoginOptions = Omit<PublicKeyCredentialRequestOptions, "challenge" | "allowCredentials"> & {
  challenge: string;
  allowCredentials?: CredentialID[];
};

function decode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function encode(value: ArrayBuffer) {
  const binary = Array.from(new Uint8Array(value), (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function credentialResult(result: Credential | null) {
  if (!(result instanceof PublicKeyCredential)) throw new Error("passkey_cancelled");
  return {
    id: result.id,
    rawId: encode(result.rawId),
    type: result.type,
    clientExtensionResults: result.getClientExtensionResults(),
  };
}

export async function createPasskey(options: RegistrationOptions) {
  const result = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: decode(options.challenge),
      user: { ...options.user, id: decode(options.user.id) },
      excludeCredentials: options.excludeCredentials?.map((item) => ({ ...item, id: decode(item.id) })),
    },
  }) as PublicKeyCredential | null;
  const credential = credentialResult(result);
  const attestation = result.response as AuthenticatorAttestationResponse;
  return {
    ...credential,
    response: {
      clientDataJSON: encode(attestation.clientDataJSON),
      attestationObject: encode(attestation.attestationObject),
      transports: attestation.getTransports?.(),
    },
  };
}

export async function getPasskey(options: LoginOptions) {
  const result = await navigator.credentials.get({
    publicKey: {
      ...options,
      challenge: decode(options.challenge),
      allowCredentials: options.allowCredentials?.map((item) => ({ ...item, id: decode(item.id) })),
    },
  }) as PublicKeyCredential | null;
  const credential = credentialResult(result);
  const assertion = result.response as AuthenticatorAssertionResponse;
  return {
    ...credential,
    response: {
      clientDataJSON: encode(assertion.clientDataJSON),
      authenticatorData: encode(assertion.authenticatorData),
      signature: encode(assertion.signature),
      userHandle: assertion.userHandle ? encode(assertion.userHandle) : undefined,
    },
  };
}
