import { useId, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { isDemo } from "../runtime.js";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
  useMediaQuery,
  Container,
  Divider,
  Link,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import options from "../../../shared/options.json";
import {
  useConnectMutation,
  useGetConnectionsQuery,
  useSession,
} from "./store";
import {
  averageRating,
  avatar,
  courseImage,
  errorMessage,
  money,
} from "./utils";
export function PageTitle({ title, subtitle, children }) {
  return (
    <Box className="hero" sx={{ py: { xs: 4, md: 5 }, mb: 4 }}>
      <Container maxWidth="lg">
        <Typography className="eyebrow" sx={{ mb: 1.5 }}>
          A place to grow
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: 34, md: 48 }, color: "text.primary" }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 17 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  );
}
export function QueryState({ query, empty, children }) {
  if (query.isLoading)
    return (
      <Stack sx={{ py: 8, alignItems: "center" }}>
        <CircularProgress />
        <Typography role="status" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Stack>
    );
  if (query.error)
    return (
      <Alert severity="error">
        {errorMessage(query.error)}{" "}
        <Button onClick={query.refetch}>Try again</Button>
      </Alert>
    );
  if (empty)
    return (
      <Alert severity="info">
        No results yet. Try different filters or add a profile.
      </Alert>
    );
  return children;
}
export function Filters({ initialSubject, onApply }) {
  const initial = {
    district: [],
    grade: [],
    subject: initialSubject ? [initialSubject] : [],
  };
  const [values, setValues] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const desktop = useMediaQuery("(min-width:900px)");
  const filterId = useId();
  return (
    <Card sx={{ mb: 3, boxShadow: "none" }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: desktop || expanded ? 2 : 0,
          }}
        >
          <TuneRounded sx={{ fontSize: 19, color: "primary.main" }} />
          <Typography sx={{ fontWeight: 700 }}>Find your fit</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Choose what matters to you.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={filterId}
            sx={{ display: { xs: "inline-flex", md: "none" }, ml: "auto" }}
          >
            {expanded ? "Hide filters" : "Show filters"}
          </Button>
        </Stack>
        <Collapse in={desktop || expanded} id={filterId}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              onApply(values);
            }}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr) auto" },
              gap: 2,
              alignItems: "start",
            }}
          >
            {[
              ["district", "District", options.districts],
              ["grade", "Grade", options.grades],
              ["subject", "Subject", options.subjects],
            ].map(([key, label, items]) => (
              <Autocomplete
                key={key}
                multiple
                options={items}
                value={values[key]}
                onChange={(e, value) => setValues({ ...values, [key]: value })}
                renderInput={(params) => (
                  <TextField {...params} label={label} />
                )}
              />
            ))}
            <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
              <Button type="submit" variant="contained" sx={{ minHeight: 48 }}>
                Find
              </Button>
              <Button
                onClick={() => {
                  const cleared = { district: [], grade: [], subject: [] };
                  setValues(cleared);
                  onApply(cleared);
                }}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
export function ConnectionButton({ profile, kind }) {
  const { user } = useSession();
  const connections = useGetConnectionsQuery(undefined, { skip: !user });
  const [connect, { isLoading }] = useConnectMutation();
  const [error, setError] = useState("");
  if (isDemo)
    return (
      <Button variant="outlined" disabled>
        Connections disabled in demo
      </Button>
    );
  if (!user)
    return (
      <Button component={RouterLink} to="/signin" variant="outlined">
        Sign in to connect
      </Button>
    );
  if (user.role !== (kind === "teacher" ? "student" : "teacher")) return null;
  const connected = connections.data?.some(
    (c) =>
      String((kind === "teacher" ? c.teacherId : c.studentId)?._id) ===
      profile._id,
  );
  return (
    <Stack spacing={1}>
      <Button
        variant="contained"
        disabled={isLoading || connected || !profile.available}
        onClick={async () => {
          setError("");
          try {
            await connect(profile._id).unwrap();
          } catch (e) {
            setError(errorMessage(e));
          }
        }}
      >
        {connected ? "Connected" : isLoading ? "Connecting..." : "Connect"}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}
export function ProfileCard({ profile, kind = "teacher" }) {
  const isTeacher = kind === "teacher";
  const href = "/" + (isTeacher ? "teachers" : "students") + "/" + profile._id;
  return (
    <Card
      className="profile-card"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box className="profile-cover">
        <Chip
          size="small"
          label={profile.available ? "Available" : "Not available"}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1,
            background: "#fff",
            color: profile.available ? "primary.main" : "text.secondary",
          }}
        />
      </Box>
      <CardContent
        sx={{ pt: 0, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Avatar
          src={avatar(profile)}
          alt={profile.name}
          sx={{
            width: 76,
            height: 76,
            mt: -4.5,
            mb: 1.5,
            border: "4px solid #fff",
            bgcolor: "primary.main",
          }}
        >
          {profile.name?.[0]}
        </Avatar>
        <Link
          component={RouterLink}
          to={href}
          underline="hover"
          color="text.primary"
        >
          <Typography variant="h6">{profile.name}</Typography>
        </Link>
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ mt: 0.75, alignItems: "center", color: "text.secondary" }}
        >
          <LocationOnOutlined sx={{ fontSize: 16 }} />
          <Typography variant="caption">
            {profile.district.join(", ") || "Location not provided"}
          </Typography>
        </Stack>
        {isTeacher && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1, alignItems: "center" }}
          >
            <Rating
              size="small"
              readOnly
              precision={0.5}
              value={averageRating(profile)}
            />
            <Typography variant="caption" color="text.secondary">
              {profile.commentCount
                ? `${averageRating(profile).toFixed(1)} (${profile.commentCount} reviews)`
                : "No reviews yet"}
            </Typography>
          </Stack>
        )}
        <Stack direction="row" sx={{ my: 2, flexWrap: "wrap", gap: 0.75 }}>
          {profile.subject.map((subject) => (
            <Chip
              key={subject}
              label={subject}
              size="small"
              sx={{ bgcolor: "#edf2e8", color: "primary.dark" }}
            />
          ))}
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 42,
          }}
        >
          {profile.description || "Explore this profile to learn more."}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          {profile.grade.join(", ")}
        </Typography>
        {isTeacher && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            {options.days
              .filter((day) => profile.weekly?.includes(day.value))
              .map((day) => day.label)
              .join(", ") || "Ask about availability"}
          </Typography>
        )}
        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ mb: 2 }} />
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tuition fee
              </Typography>
              <Typography sx={{ fontWeight: 750 }}>
                {money(profile.fee)}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to={href}
              size="small"
              endIcon={<ArrowForwardRounded />}
              aria-label={"View profile for " + profile.name}
            >
              Profile
            </Button>
          </Stack>
          <ConnectionButton profile={profile} kind={kind} />
        </Box>
      </CardContent>
    </Card>
  );
}
export function CourseCard({ course }) {
  return (
    <Card
      className="course-card"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          m: 1.25,
          mb: 0,
          bgcolor: "#f0f3eb",
          borderRadius: 2.5,
          overflow: "hidden",
        }}
      >
        <CardMedia
          component="img"
          height="160"
          image={courseImage(course)}
          alt={course.name}
          loading="lazy"
          sx={{ objectFit: "cover" }}
        />
      </Box>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography className="eyebrow" sx={{ mb: 1, fontSize: 10 }}>
          Discover a new possibility
        </Typography>
        <Typography variant="h6">{course.name}</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            my: 1.5,
            minHeight: 42,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description}
        </Typography>
        <Button
          component={RouterLink}
          to={"/courses/" + course._id}
          endIcon={<ArrowForwardRounded />}
          sx={{ mt: "auto", justifyContent: "space-between", px: 0 }}
        >
          Explore course
        </Button>
      </CardContent>
    </Card>
  );
}
export function ImagePicker({ onChange, preview, label = "Choose image" }) {
  return (
    <Stack spacing={1}>
      {preview && (
        <Box
          component="img"
          src={preview}
          alt="Selected image"
          sx={{ width: 120, height: 100, objectFit: "cover", borderRadius: 2 }}
        />
      )}
      <Button component="label" variant="outlined" sx={{ alignSelf: "start" }}>
        {label}
        <input
          hidden
          type="file"
          accept="image/png,image/jpeg,image/gif"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </Button>
      <Typography variant="caption" color="text.secondary">
        PNG, JPEG, or GIF. Up to 1 MB
      </Typography>
    </Stack>
  );
}
