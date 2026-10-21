"use client";
import React, {useEffect, useRef, useState} from "react";
import {z} from "zod";
import {Camera} from "iconsax-react";
import {useOrganizationInfo} from "@/hooks/org/useOrganizationInfo";
import {updateOrganizationService} from "@/services/organizer.service";
import {useSession} from "next-auth/react";
import {resolveAvatarUrl} from "@/lib/format";
import Image from "next/image";
import {changeOrgAvatarAction} from "@/actions/organizer.action";
import {toast} from "sonner";
import Toast from "@/components/modals/Toast";

type FieldErrors = {
    name?: string;
    phone?: string;
    website?: string;
    about?: string;
};

const nameSchema = z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters")
    .refine((val) => !/\s{2,}/.test(val), "Use only a single space between words")
    .refine((val) => val.split(" ").filter(Boolean).length <= 15, "Name must be 15 words or fewer")
    // .refine((val) => /^[A-Za-z\u1780-\u17FF\s]+$/.test(val), "Name can only contain letters and spaces");

const phoneSchema = z
    .string()
    .trim()
    .refine(
        (val) => {
            if (!val) return true; // empty is allowed, optional field
            const phonePattern = /^0[0-9]+(?: [0-9]+)*$/;
            const digitsOnly = val.replace(/\D/g, "");
            return phonePattern.test(val) && digitsOnly.length >= 8 && digitsOnly.length <= 10;
        },
        "Enter a valid phone number starting with 0 (e.g. 012 345 678)"
    );

const websiteSchema = z
    .string()
    .trim()
    .refine(
        (val) => {
            if (!val) return true; // empty is allowed, optional field
            try {
                const toCheck = /^https?:\/\//i.test(val) ? val : `https://${val}`;
                const url = new URL(toCheck);
                return url.hostname.includes(".");
            } catch {
                return false;
            }
        },
        "Enter a valid website URL"
    );

const aboutSchema = z.string().trim().max(500, "About must be 500 characters or fewer");

const personalInfoSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    website: websiteSchema,
    about: aboutSchema,
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

function validateField(field: keyof PersonalInfoValues, value: string): string | undefined {
    let result;
    switch (field) {
        case "name":
            result = nameSchema.safeParse(value);
            break;
        case "phone":
            result = phoneSchema.safeParse(value);
            break;
        case "website":
            result = websiteSchema.safeParse(value);
            break;
        case "about":
            result = aboutSchema.safeParse(value);
            break;
    }
    if (!result.success) {
        return result.error.issues[0]?.message;
    }
    return undefined;
}

function validateFields(values: PersonalInfoValues): FieldErrors {
    const result = personalInfoSchema.safeParse(values);
    if (result.success) return {};

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!errors[key]) errors[key] = issue.message;
    }
    return errors;
}

export default function PersonalInfo() {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const {data: session} = useSession();
    const {infoOrg, loading} = useOrganizationInfo();

    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});

    useEffect(() => {
        if (infoOrg) {
            setName(infoOrg.name ?? "");
            setAbout(infoOrg.about ?? "");
            setPhone(infoOrg.phone ?? "");
            setWebsite(infoOrg.website ?? "");
        }
    }, [infoOrg]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleSave = async () => {
        const fieldErrors = validateFields({name, phone, website, about});
        setErrors(fieldErrors);

        if (Object.keys(fieldErrors).length > 0) {
            toast.custom((t) => (
                <Toast
                    title="Check your info"
                    message="Please fix the highlighted fields before saving"
                    type="error"
                    onCloseAction={() => toast.dismiss(t)}
                />
            ));
            return;
        }

        try {
            setSaving(true);
            const orgId = session?.user?.orgId;
            const orgToken = session?.user?.accessToken;

            if (!orgId || !orgToken) {
                throw new Error("Organization information not found");
            }

            await updateOrganizationService(orgId, orgToken, {
                name: name.trim(),
                about: about.trim(),
                phone: phone.trim(),
                website: website.trim(),
            });

            toast.custom((t) => (
                <Toast
                    title="Success"
                    message={"Organization updated successfully"}
                    type="success"
                    onCloseAction={() => toast.dismiss(t)}
                />
            ));

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            console.error(err);
            alert("Failed to update organization");
        } finally {
            setSaving(false);
        }
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a PNG, JPG, or WEBP image");
            e.target.value = "";
            return;
        }

        if (file.size > maxSizeBytes) {
            alert("Image must be smaller than 5MB");
            e.target.value = "";
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
        });

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("logo", file);

            const res = await changeOrgAvatarAction(formData);
            if (!res.success) throw new Error(res.error);

            toast.custom((t) => (
                <Toast
                    title="Success"
                    message={"Logo updated successfully"}
                    type="success"
                    onCloseAction={() => toast.dismiss(t)}
                />
            ));

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Failed to upload logo");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl card-shadow w-full p-5 md:p-6 lg:p-8">
            <div className="mb-8 border-b border-[#f3f3f3] pb-4">
                <h2 className="text-xl font-bold secondary-color">Personal Information</h2>
            </div>

            <div className="flex flex-col gap-4 max-w-4xl">

                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                    <label className="w-full md:w-[180px] text-des font-medium shrink-0">
                        Profile Picture
                    </label>
                    <div className="flex items-center justify-center gap-6 flex-1">
                        <div
                            className="relative w-25 h-25 rounded-full overflow-hidden border-[var(--input-border)] shadow-sm group">
                            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                                   onChange={handleFileChange} disabled={uploading}/>
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Profile" fill className="object-cover w-full h-full" />
                            ) : (
                                <Image src={resolveAvatarUrl(infoOrg?.logo) || "/images/fallback-pf.png"} alt={infoOrg?.name || "Organization Logo"} fill className="object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={openFilePicker}
                                disabled={uploading}
                                className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center w-full h-full bg-black/40">
                                        <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                    </span>
                                ) : (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={20} color="#ffffff"/>
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                    <label className="w-full md:w-[180px] text-des font-medium shrink-0 md:pt-3">Full Name</label>
                    <div className="flex-1 flex flex-col">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                const value = e.target.value;
                                setName(value);
                                setErrors((prev) => ({...prev, name: validateField("name", value)}));
                            }}
                            placeholder={loading ? "loading..." : ""}
                            aria-invalid={!!errors.name}
                            className={`border rounded-lg px-4 py-3 outline-none transition-colors text-secondary-color text-sm ${
                                errors.name
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[var(--input-border)] focus:border-[var(--main-color)]"
                            }`}
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                    <label className="w-full md:w-[180px] text-des font-medium shrink-0">Province</label>
                    <input
                        type="text"
                        value={infoOrg?.province ?? ""}
                        readOnly
                        className="flex-1 border border-[var(--input-border)] rounded-lg px-4 py-3 outline-none bg-gray-50 text-secondary-color text-sm"
                    />
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                    <label className="w-full md:w-[180px] text-des font-medium shrink-0 md:pt-3">Phone</label>
                    <div className="flex-1 flex flex-col">
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => {
                                const value = e.target.value;
                                setPhone(value);
                                setErrors((prev) => ({...prev, phone: validateField("phone", value)}));
                            }}
                            placeholder={loading ? "loading..." : "e.g. 012 345 678"}
                            aria-invalid={!!errors.phone}
                            className={`border rounded-lg px-4 py-3 outline-none transition-colors text-secondary-color text-sm ${
                                errors.phone
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[var(--input-border)] focus:border-[var(--main-color)]"
                            }`}
                        />
                        {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                    <label className="w-full md:w-[180px] text-des font-medium shrink-0 md:pt-3">Website</label>
                    <div className="flex-1 flex flex-col">
                        <input
                            type="text"
                            value={website}
                            onChange={(e) => {
                                const value = e.target.value;
                                setWebsite(value);
                                setErrors((prev) => ({...prev, website: validateField("website", value)}));
                            }}
                            placeholder={loading ? "loading..." : "e.g. https://example.com"}
                            aria-invalid={!!errors.website}
                            className={`border rounded-lg px-4 py-3 outline-none transition-colors text-secondary-color text-sm ${
                                errors.website
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[var(--input-border)] focus:border-[var(--main-color)]"
                            }`}
                        />
                        {errors.website && <span className="text-xs text-red-500 mt-1">{errors.website}</span>}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:gap-8">
                    <label className="w-full md:w-[180px] text-des font-medium shrink-0 pt-3">About</label>
                    <div className="flex-1 flex flex-col">
                        <textarea
                            value={about}
                            maxLength={500}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAbout(value);
                                setErrors((prev) => ({...prev, about: validateField("about", value)}));
                            }}
                            placeholder={loading ? "loading..." : ""}
                            aria-invalid={!!errors.about}
                            className={`border rounded-lg px-4 py-3 outline-none transition-colors text-secondary-color text-sm h-[100px] resize-none leading-relaxed ${
                                errors.about
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[var(--input-border)] focus:border-[var(--main-color)]"
                            }`}
                        />
                        <div className="flex justify-between items-center mt-2">
                            {errors.about ? (
                                <span className="text-xs text-red-500">{errors.about}</span>
                            ) : <span />}
                            <span className="text-xs text-gray-400">{about.length}/500 characters</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-main text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}