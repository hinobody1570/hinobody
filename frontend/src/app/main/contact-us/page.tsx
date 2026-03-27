"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { IoMailOutline, IoSend } from "react-icons/io5";
import { contactSubmissionsApi } from "@/lib/api";

type ContactCategory = "" | "general" | "support" | "policy" | "report" | "other";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  category: ContactCategory;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;
type TouchedMap = Partial<Record<keyof ContactFormData, boolean>>;

const SUPPORT_EMAIL = "hinobodysupport@gmail.com";
const NAME_MAX = 100;
const EMAIL_MAX = 255;
const SUBJECT_MAX = 255;
const MAX_MESSAGE_LENGTH = 1000;

function isValidContactName(name: string) {
  return /^[A-Za-z ]+$/.test(name);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactUsPage() {
  const t = useTranslations("contact");

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [touched, setTouched] = useState<TouchedMap>({});
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isReadyToSend, setIsReadyToSend] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (data: ContactFormData): ContactFormErrors => {
    const nextErrors: ContactFormErrors = {};

    const name = data.name.trim();
    if (!name) nextErrors.name = t("errors.nameRequired");
    else if (name.length > NAME_MAX) nextErrors.name = t("errors.nameTooLong", { max: NAME_MAX });
    else if (!isValidContactName(name)) nextErrors.name = t("errors.nameInvalid");

    const email = data.email.trim();
    if (!email) nextErrors.email = t("errors.emailRequired");
    else if (email.length > EMAIL_MAX) nextErrors.email = t("errors.emailTooLong", { max: EMAIL_MAX });
    else if (!isValidEmail(email)) nextErrors.email = t("errors.emailInvalid");

    const subject = data.subject.trim();
    if (!subject) nextErrors.subject = t("errors.subjectRequired");
    else if (subject.length > SUBJECT_MAX) nextErrors.subject = t("errors.subjectTooLong", { max: SUBJECT_MAX });

    const message = data.message.trim();
    if (!message) nextErrors.message = t("errors.messageRequired");
    else if (message.length < 10) nextErrors.message = t("errors.messageTooShort");
    else if (message.length > MAX_MESSAGE_LENGTH) nextErrors.message = t("errors.messageTooLong", { max: MAX_MESSAGE_LENGTH });

    return nextErrors;
  };

  const shouldValidate = useMemo(() => Object.values(touched).some(Boolean), [touched]);

  useEffect(() => {
    if (!shouldValidate) return;
    setErrors(validate(formData));
  }, [formData, shouldValidate]);

  const mailtoHref = useMemo(() => {
    const subject = `[Hinobody] ${formData.subject.trim() || t("mail.subjectFallback")}`;
    const bodyLines = [
      `${t("mail.name")}: ${formData.name.trim()}`,
      `${t("mail.email")}: ${formData.email.trim()}`,
      `${t("mail.category")}: ${
        formData.category ? t(`categories.${formData.category}` as any) : t("categories.placeholder")
      }`,
      "",
      `${t("mail.message")}:`,
      formData.message.trim(),
    ];

    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  }, [formData, t]);

  const setField = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (submitError) setSubmitError(null);
  };

  const markTouched = (key: keyof ContactFormData) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const reset = () => {
    setFormData({ name: "", email: "", subject: "", category: "", message: "" });
    setTouched({});
    setErrors({});
    setIsReadyToSend(false);
    setCopied(false);
    setIsSubmitting(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextTouched: TouchedMap = { name: true, email: true, subject: true, category: true, message: true };
    setTouched(nextTouched);

    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await contactSubmissionsApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        category: formData.category || "general",
        message: formData.message.trim(),
      });

      setIsReadyToSend(true);
    } catch (err: any) {
      setSubmitError(err?.message || t("errors.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      const text = decodeURIComponent(mailtoHref.split("body=")[1] ?? "");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const hasError = (key: keyof ContactFormData) => Boolean(errors[key] && touched[key]);

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t("intro")}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <IoMailOutline className="text-teal-600" />
              {t("cardTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t("cardSubtitle")}</p>
          </div>

          {isReadyToSend ? (
            <div className="p-6 sm:p-8">
              <div className="max-w-xl mx-auto text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <IoSend className="text-teal-700" size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{t("success.title")}</h3>
                <p className="text-gray-600 text-sm sm:text-base mt-2">
                  {t("success.body", { email: SUPPORT_EMAIL })}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch justify-center gap-3">
                  <a
                    href={mailtoHref}
                    className="inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
                  >
                    <IoMailOutline />
                    {t("success.openEmail")}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex cursor-pointer justify-center items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition"
                  >
                    {copied ? t("success.copied") : t("success.copy")}
                  </button>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-sm font-semibold cursor-pointer text-teal-700 hover:text-teal-800"
                  >
                    {t("success.sendAnother")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              {submitError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("nameLabel")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value.replace(/[^A-Za-z ]+/g, ""))}
                    onBlur={() => markTouched("name")}
                    placeholder={t("namePlaceholder")}
                    maxLength={NAME_MAX}
                    aria-invalid={hasError("name")}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 outline-none transition ${
                      hasError("name")
                        ? "border-red-300 ring-2 ring-red-50"
                        : "border-gray-200 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    }`}
                  />
                  {hasError("name") && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("emailLabel")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => markTouched("email")}
                    placeholder={t("emailPlaceholder")}
                    maxLength={EMAIL_MAX}
                    aria-invalid={hasError("email")}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 outline-none transition ${
                      hasError("email")
                        ? "border-red-300 ring-2 ring-red-50"
                        : "border-gray-200 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    }`}
                  />
                  {hasError("email") && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("subjectLabel")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    onBlur={() => markTouched("subject")}
                    placeholder={t("subjectPlaceholder")}
                    maxLength={SUBJECT_MAX}
                    aria-invalid={hasError("subject")}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 outline-none transition ${
                      hasError("subject")
                        ? "border-red-300 ring-2 ring-red-50"
                        : "border-gray-200 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    }`}
                  />
                  {hasError("subject") && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("categories.label")}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setField("category", e.target.value as ContactCategory)}
                    onBlur={() => markTouched("category")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 outline-none transition hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
                  >
                    <option value="">{t("categories.placeholder")}</option>
                    <option value="general">{t("categories.general")}</option>
                    <option value="support">{t("categories.support")}</option>
                    <option value="policy">{t("categories.policy")}</option>
                    <option value="report">{t("categories.report")}</option>
                    <option value="other">{t("categories.other")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t("messageLabel")} <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setField("message", e.target.value)}
                  onBlur={() => markTouched("message")}
                  placeholder={t("messagePlaceholder")}
                  maxLength={MAX_MESSAGE_LENGTH}
                  aria-invalid={hasError("message")}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 outline-none transition resize-none ${
                    hasError("message")
                      ? "border-red-300 ring-2 ring-red-50"
                      : "border-gray-200 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {hasError("message") ? (
                    <p className="text-xs text-red-600">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-gray-400">
                    {formData.message.length} / {MAX_MESSAGE_LENGTH}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400">
                  <span className="text-red-400">*</span> {t("requiredFields")}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-semibold rounded-full transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <IoSend />
                  {isSubmitting ? t("sendingButton") : t("sendButton")}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          {t("footer.emailUs")}{" "}
          <a className="font-semibold text-teal-700 hover:text-teal-800" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
