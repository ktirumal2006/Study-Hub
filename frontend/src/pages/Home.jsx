// frontend/src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();

  // Persisted user display name
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );

  // Create Group state
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [createError, setCreateError] = useState({
    userName: "",
    groupId: "",
    groupName: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Join Group state
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState({
    userName: "",
    joinId: "",
  });
  const [isJoining, setIsJoining] = useState(false);

  // Validation
  const validateGroupName = (name) => {
    if (!name.trim()) return "Group name is required";
    if (name.trim().length < 3) return "Group name must be at least 3 characters";
    if (name.trim().length > 32) return "Group name must be 32 characters or less";
    return "";
  };

  const validateGroupId = (id) => {
    const upperId = id.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!upperId) return "Group ID is required";
    if (upperId.length < 6) return "Group ID must be at least 6 characters";
    if (upperId.length > 8) return "Group ID must be 8 characters or less";
    return "";
  };

  // Handlers
  const handleCreate = async () => {
    const errors = {
      userName: !userName.trim() ? "Please enter your name." : "",
      groupId: validateGroupId(groupId),
      groupName: validateGroupName(groupName),
    };

    setCreateError(errors);

    if (Object.values(errors).some((e) => e)) return;

    localStorage.setItem("userName", userName.trim());
    const upperGroupId = groupId.toUpperCase().replace(/[^A-Z0-9]/g, "");

    setIsCreating(true);
    try {
      await api.post("/group", {
        groupId: upperGroupId,
        groupName: groupName.trim(),
        createdBy: userName.trim(),
      });
      await api.post("/group/join", {
        groupId: upperGroupId,
        userId: userName.trim(),
      });
      toast.success("Group created successfully!");
      navigate(`/group/${upperGroupId}`);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to create group";
      toast.error(message);
      setCreateError((prev) => ({ ...prev, groupId: message }));
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    const errors = {
      userName: !userName.trim() ? "Please enter your name." : "",
      joinId: validateGroupId(joinId),
    };

    setJoinError(errors);

    if (Object.values(errors).some((e) => e)) return;

    localStorage.setItem("userName", userName.trim());
    const upperJoinId = joinId.toUpperCase().replace(/[^A-Z0-9]/g, "");

    setIsJoining(true);
    try {
      await api.post("/group/join", {
        groupId: upperJoinId,
        userId: userName.trim(),
      });
      toast.success("Joined group successfully!");
      navigate(`/group/${upperJoinId}`);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to join group";
      toast.error(message);
      setJoinError((prev) => ({ ...prev, joinId: message }));
    } finally {
      setIsJoining(false);
    }
  };

  const handleGroupIdChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setGroupId(value);
    if (createError.groupId) {
      setCreateError((prev) => ({ ...prev, groupId: validateGroupId(value) }));
    }
  };

  const handleJoinIdChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setJoinId(value);
    if (joinError.joinId) {
      setJoinError((prev) => ({ ...prev, joinId: validateGroupId(value) }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Group Card */}
        <Card hover>
          <CardHeader>
            <CardTitle>Create a Study Group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Your Name"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (createError.userName) {
                  setCreateError((prev) => ({ ...prev, userName: "" }));
                }
              }}
              error={createError.userName}
              placeholder="Enter your name"
            />

            <Input
              label="Group Name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (createError.groupName) {
                  setCreateError((prev) => ({ ...prev, groupName: "" }));
                }
              }}
              onBlur={(e) => {
                const error = validateGroupName(e.target.value);
                setCreateError((prev) => ({ ...prev, groupName: error }));
              }}
              error={createError.groupName}
              placeholder="e.g., CS Study Group"
              helperText="3-32 characters"
            />

            <Input
              label="Group ID"
              value={groupId}
              onChange={handleGroupIdChange}
              onBlur={(e) => {
                const error = validateGroupId(e.target.value);
                setCreateError((prev) => ({ ...prev, groupId: error }));
              }}
              error={createError.groupId}
              placeholder="ABC123"
              helperText="6-8 uppercase letters/numbers"
              maxLength={8}
            />

            <Button
              onClick={handleCreate}
              loading={isCreating}
              fullWidth
              disabled={isCreating}
            >
              Create Group
            </Button>
          </CardContent>
        </Card>

        {/* Join Group Card */}
        <Card hover>
          <CardHeader>
            <CardTitle>Join a Study Group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Your Name"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (joinError.userName) {
                  setJoinError((prev) => ({ ...prev, userName: "" }));
                }
              }}
              error={joinError.userName}
              placeholder="Enter your name"
            />

            <Input
              label="Group Code"
              value={joinId}
              onChange={handleJoinIdChange}
              onBlur={(e) => {
                const error = validateGroupId(e.target.value);
                setJoinError((prev) => ({ ...prev, joinId: error }));
              }}
              error={joinError.joinId}
              placeholder="Enter group code"
              helperText="6-8 uppercase letters/numbers"
              maxLength={8}
            />

            <Button
              onClick={handleJoin}
              loading={isJoining}
              fullWidth
              variant="secondary"
              disabled={isJoining}
            >
              Join Group
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

