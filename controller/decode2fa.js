const { totp } = require("otplib")

const decode2fa = async (code_2fa) => {
    const token = code_2fa.split(" ").join("")

    const code = totp.generate(token)

    return code
}

module.exports = decode2fa
