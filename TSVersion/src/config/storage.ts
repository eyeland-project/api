import { Storage, Bucket } from "@google-cloud/storage";

let storage: Storage | undefined = undefined;

function authCloudStorage(): Storage {
  const credentials = getCredentias();
  if (!credentials) {
    throw new Error("CLOUD_STORAGE_CREDENTIALS is not defined");
  }
  const { client_email, client_id, private_key, project_id, token_uri, type } =
    credentials;

  return new Storage({
    projectId: project_id,
    // scopes: [
    //   "https://www.googleapis.com/auth/cloud-platform",
    //   "https://www.googleapis.com/auth/devstorage.full_control",
    //   "https://www.googleapis.com/auth/devstorage.read_only",
    //   "https://www.googleapis.com/auth/devstorage.read_write"
    // ],
    credentials: {
      token_url: token_uri,
      type,
      private_key,
      client_email,
      client_id
    }
  });
}

export function getStorageBucket(): Bucket {
  const bucketName = process.env.CLOUD_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error("CLOUD_STORAGE_BUCKET is not defined");
  }
  if (!storage) {
    storage = authCloudStorage();
  }
  return storage.bucket(bucketName);
}

// export function getStorage() {
//   return storage;
// }

function getCredentias(): Credentials | null {
  const credentials = process.env.CLOUD_STORAGE_CREDENTIALS;
  if (!credentials) return null;
  return JSON.parse(
    Buffer.from(credentials, "base64").toString("utf8")
  ) as Credentials;
}

interface Credentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}
