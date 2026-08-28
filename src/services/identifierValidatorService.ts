import { API_BASE_URL } from "../config/api";

export async function validateIban(
    value: string
) {

    const response = await fetch(
        `${API_BASE_URL}/v1/api/iban/validate`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                value
            })
        }
    );

    return response.json();
}


export async function validateBic(
    value: string
) {

    const response = await fetch(
        `${API_BASE_URL}/v1/api/bic/validate`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                value
            })
        }
    );

    return response.json();
}