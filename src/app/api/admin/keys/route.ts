import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels, addModel, deleteModel } from "@/lib/litellm";

/**
 * GET /api/admin/keys — List all models/keys from LiteLLM
 */
export async function GET() {
    try {
        await requireAdmin();
        const models = await getModels();
        return NextResponse.json({ data: models });
    } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: e.message }, { status });
    }
}

/**
 * POST /api/admin/keys — Add a new model+key to LiteLLM
 * Body: { model_name, litellm_params: { model, api_key } }
 */
export async function POST(req: NextRequest) {
    try {
        await requireAdmin();
        const body = await req.json();

        if (!body.model_name || !body.litellm_params?.model || !body.litellm_params?.api_key) {
            return NextResponse.json(
                { error: "Missing required fields: model_name, litellm_params.model, litellm_params.api_key" },
                { status: 400 }
            );
        }

        const result = await addModel(body);
        return NextResponse.json(result);
    } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: e.message }, { status });
    }
}

/**
 * DELETE /api/admin/keys — Delete a model+key from LiteLLM
 * Body: { id }
 */
export async function DELETE(req: NextRequest) {
    try {
        await requireAdmin();
        const body = await req.json();

        if (!body.id) {
            return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
        }

        const result = await deleteModel(body.id);
        return NextResponse.json(result);
    } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: e.message }, { status });
    }
}
