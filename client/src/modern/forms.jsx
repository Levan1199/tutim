import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import options from "../../../shared/options.json";
import {
  useAddReviewMutation,
  useLoginMutation,
  useRegisterMutation,
  useSaveCourseMutation,
  useSaveProfileMutation,
} from "./store";
import { avatar, courseImage, errorMessage } from "./utils";
import { ImagePicker, PageTitle } from "./components";
const credentials = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(
      /^[a-z0-9._-]+$/,
      "Use letters, numbers, dots, underscores, or hyphens.",
    ),
  password: z.string().min(10, "Use at least 10 characters.").max(128),
});
const loginCredentials = credentials.extend({
  username: z.string().trim().min(1, "Enter your username.").max(100),
  password: z.string().min(1, "Enter your password.").max(128),
});
export function AuthPage({ signup = false }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useLoginMutation();
  const [registerAccount] = useRegisterMutation();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signup ? credentials : loginCredentials),
    defaultValues: { username: "", password: "" },
  });
  return (
    <>
      <PageTitle
        title={signup ? "Create your account" : "Welcome back"}
        subtitle={
          signup
            ? "Find the right teacher or share your expertise."
            : "Sign in to manage your profile and connections."
        }
      />
      <Container maxWidth="sm" sx={{ pb: 6 }}>
        <Box
          className="auth-card"
          component="form"
          onSubmit={handleSubmit(async (values) => {
            setError("");
            try {
              await (signup ? registerAccount : login)(values).unwrap();
              navigate(signup ? "/profile" : "/");
            } catch (e) {
              setError(errorMessage(e));
            }
          })}
        >
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Username"
              autoComplete="username"
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((value) => !value)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffOutlined />
                        ) : (
                          <VisibilityOutlined />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              autoComplete={signup ? "new-password" : "current-password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : signup
                  ? "Create account"
                  : "Sign in"}
            </Button>
            <Button component={RouterLink} to={signup ? "/signin" : "/signup"}>
              {signup
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.union([z.email(), z.literal("")]),
  telnum: z.string().max(40),
  fee: z.number().min(0).max(100000000),
  description: z.string().max(4000),
  district: z.array(z.enum(options.districts)),
  grade: z.array(z.enum(options.grades)),
  subject: z.array(z.enum(options.subjects)),
  weekly: z.array(z.number().int().min(2).max(8)),
  address: z.string().max(300),
  available: z.boolean(),
});
export function ProfileForm({ role, profile }) {
  const [save] = useSaveProfileMutation();
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      telnum: profile?.telnum || "",
      fee: profile?.fee || 0,
      description: profile?.description || "",
      district: profile?.district || [],
      grade: profile?.grade || [],
      subject: profile?.subject || [],
      weekly: profile?.weekly || [],
      address: profile?.address || "",
      available: profile?.available ?? true,
    },
  });
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(async (values) => {
        setFeedback(null);
        try {
          await save({ ...values, role, file }).unwrap();
          setFile(null);
          setFeedback({
            severity: "success",
            text: "Your profile has been saved.",
          });
        } catch (e) {
          setFeedback({ severity: "error", text: errorMessage(e) });
        }
      })}
    >
      <Stack spacing={3}>
        {feedback && (
          <Alert severity={feedback.severity}>{feedback.text}</Alert>
        )}
        <ImagePicker preview={avatar(profile)} onChange={setFile} />
        {file && <Typography variant="body2">Selected: {file.name}</Typography>}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {[
            ["name", "Name"],
            ["email", "Email"],
            ["telnum", "Phone"],
          ].map(([field, label]) => (
            <TextField
              key={field}
              label={label}
              {...register(field)}
              error={!!errors[field]}
              helperText={errors[field]?.message}
            />
          ))}
          <TextField
            label="Tuition fee (VND)"
            type="number"
            {...register("fee", { valueAsNumber: true })}
            error={!!errors.fee}
            helperText={errors.fee?.message}
          />
        </Box>
        {[
          ["district", "District", options.districts],
          ["grade", "Grade", options.grades],
          ["subject", "Subject", options.subjects],
          ...(role === "teacher"
            ? [
                [
                  "weekly",
                  "Available weekdays",
                  options.days.map((d) => ({ value: d.value, label: d.label })),
                ],
              ]
            : []),
        ].map(([name, label, items]) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <TextField
                select
                label={label}
                {...field}
                slotProps={{ select: { multiple: true } }}
                error={!!errors[name]}
                helperText={errors[name]?.message}
              >
                {items.map((item) => (
                  <MenuItem key={item.value || item} value={item.value || item}>
                    {item.label || item}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ))}
        {role === "student" && (
          <TextField
            label="Address"
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        )}
        <TextField
          label="About you"
          multiline
          minRows={4}
          {...register("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
        <Controller
          name="available"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Available for new connections"
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
            />
          )}
        />
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save profile"}
        </Button>
      </Stack>
    </Box>
  );
}
const courseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(4000),
});
export function CourseEditor({ open, onClose, course }) {
  const [saveCourse] = useSaveCourseMutation();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: "", description: "" },
  });
  useEffect(() => {
    if (open) {
      reset({
        name: course?.name || "",
        description: course?.description || "",
      });
      setFile(null);
      setError("");
    }
  }, [open, course, reset]);
  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={handleSubmit(async (values) => {
          setError("");
          try {
            await saveCourse({ ...values, file, id: course?._id }).unwrap();
            onClose();
          } catch (e) {
            setError(errorMessage(e));
          }
        })}
      >
        <DialogTitle>{course ? "Edit course" : "Add course"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Course name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Description"
              multiline
              minRows={4}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <ImagePicker preview={courseImage(course)} onChange={setFile} />
            {file && <Typography>{file.name}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save course"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(2000),
});
export function ReviewForm({ teacherId }) {
  const [addReview] = useAddReviewMutation();
  const [feedback, setFeedback] = useState(null);
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(async (values) => {
        setFeedback(null);
        try {
          await addReview({ ...values, teacherId }).unwrap();
          reset();
          setFeedback({
            severity: "success",
            text: "Your review has been added.",
          });
        } catch (e) {
          setFeedback({ severity: "error", text: errorMessage(e) });
        }
      })}
    >
      <Stack spacing={2}>
        {feedback && (
          <Alert severity={feedback.severity}>{feedback.text}</Alert>
        )}
        <Typography variant="h6">Share your experience</Typography>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <Rating
              name="Your rating"
              value={field.value}
              onChange={(e, value) => field.onChange(value || 1)}
            />
          )}
        />
        <TextField
          label="Your review"
          multiline
          minRows={3}
          {...register("comment")}
          error={!!errors.comment}
          helperText={errors.comment?.message}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ alignSelf: "start" }}
        >
          {isSubmitting ? "Posting..." : "Post review"}
        </Button>
      </Stack>
    </Box>
  );
}
