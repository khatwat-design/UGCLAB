import Foundation

class AuthService {
    static let shared = AuthService()

    func login(email: String, password: String) async throws -> (token: String, user: User) {
        let response = try await APIClient.shared.post(APIEndpoint.login, body: [
            "email": email, "password": password,
        ])
        let token = response["token"] as? String ?? ""
        guard let userData = try? JSONSerialization.data(withJSONObject: response["user"] ?? [:]),
              let user = try? JSONDecoder().decode(User.self, from: userData)
        else { throw APIError.decoding }
        APIClient.shared.setToken(token)
        Message.currentUserId = user.id
        return (token, user)
    }

    func register(name: String, email: String, password: String, phone: String, role: String) async throws -> (token: String, user: User) {
        let response = try await APIClient.shared.post(APIEndpoint.register, body: [
            "name": name, "email": email, "password": password,
            "phone": phone, "role": role,
        ])
        let token = response["token"] as? String ?? ""
        guard let userData = try? JSONSerialization.data(withJSONObject: response["user"] ?? [:]),
              let user = try? JSONDecoder().decode(User.self, from: userData)
        else { throw APIError.decoding }
        APIClient.shared.setToken(token)
        Message.currentUserId = user.id
        return (token, user)
    }

    func getProfile() async throws -> User {
        let response = try await APIClient.shared.get(APIEndpoint.me)
        guard let userData = try? JSONSerialization.data(withJSONObject: response["user"] ?? response),
              let user = try? JSONDecoder().decode(User.self, from: userData)
        else { throw APIError.decoding }
        Message.currentUserId = user.id
        return user
    }

    func updateProfile(name: String, bio: String, avatarData: Data? = nil) async throws -> User {
        var body: [String: Any] = ["name": name, "bio": bio]
        if let avatarData {
            let upload = try await APIClient.shared.upload(path: APIEndpoint.mediaUpload, data: avatarData, fieldName: "file", fileName: "avatar.jpg", mimeType: "image/jpeg")
            body["avatar_url"] = upload["url"]
        }
        let response = try await APIClient.shared.put(APIEndpoint.updateProfile, body: body)
        guard let userData = try? JSONSerialization.data(withJSONObject: response["user"] ?? response),
              let user = try? JSONDecoder().decode(User.self, from: userData)
        else { throw APIError.decoding }
        return user
    }

    func updatePassword(currentPassword: String, newPassword: String) async throws {
        _ = try await APIClient.shared.put(APIEndpoint.updatePassword, body: [
            "current_password": currentPassword, "new_password": newPassword,
        ])
    }

    func logout() async throws {
        _ = try? await APIClient.shared.post(APIEndpoint.logout)
    }
}
