 import { IconButton, useTheme, Box, Button, Dialog, Divider, Rating, Typography, Tooltip } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useBookReviews } from "./Reviews/useBookReviews";
import CloseIcon from '@mui/icons-material/Close';
import BookCover from "./BookCover";
import ReviewList from "./Reviews/ReviewList";
import WriteReview from "./Reviews/WriteReview";
import type { Book } from "../../Models/Book/Book";
import type { Copy } from "../../Models/Book/Copy";
import { useBranches } from "../LibraryInfo/useBranches";
import axios from "../../utils/axios-api";
import Checkout from "./Checkout";
import type { Loan } from "../../Models/Book/Loan";
import { jwtDecode } from "jwt-decode";

export interface BookDetailsProps {
	modalOpen: boolean;
	selectedBook: Book | null;
	onModalClose(): void;
}

enum ActiveTabEnum {
	details = 'Details',
	copiesAvailable = 'Copies Available',
	reviews = 'Reviews',
	writeAReview = 'Write a Review'
}

function BookDetails({ modalOpen, onModalClose, selectedBook }: BookDetailsProps) {
	const theme = useTheme();
	const [activeTab, setActiveTab] = useState<ActiveTabEnum>(ActiveTabEnum.details);
	const { reviews, refreshReviews } = useBookReviews(selectedBook?.id ?? null);
	const [copies, setCopies] = useState<Copy[]>([]);
	const [loadingCopies, setLoadingCopies] = useState(false);
	const { branches, loading: branchesLoading } = useBranches();
	const [checkoutSuccess, setCheckoutSuccess] = useState<string>("");
	const prevBookId = useRef<string | null>(null);
	const [userLoans, setUserLoans] = useState<Loan[]>([]);
	const [loadingLoans, setLoadingLoans] = useState(false);

	useEffect(() => {
		if (selectedBook?.id !== prevBookId.current) {
			Promise.resolve().then(() => setCheckoutSuccess(""));
			prevBookId.current = selectedBook?.id ?? null;
		}
		if (selectedBook) {
			Promise.resolve().then(() => setLoadingCopies(true));
			axios.get(`copies/book/${selectedBook.id}`)
				.then(res => {
					setCopies(res.data);
				})
				.catch(() => setCopies([]))
				.finally(() => setLoadingCopies(false));
		} else {
			Promise.resolve().then(() => setCopies([]));
		}
	}, [selectedBook]);

	useEffect(() => {
		if (!selectedBook) {
			Promise.resolve().then(() => setUserLoans([]));
			return;
		}
		let userId: string | undefined = undefined;
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded: any = jwtDecode(token);
				userId = decoded.id || decoded.userId || decoded._id;
			} catch {
				userId = undefined;
			}
		}
		Promise.resolve().then(() => setLoadingLoans(true));
		if (!userId) {
			Promise.resolve().then(() => setUserLoans([]));
			Promise.resolve().then(() => setLoadingLoans(false));
			return;
		}
		axios.get(`/loans?userId=${userId}`)
			.then(res => setUserLoans(res.data || []))
			.catch(() => setUserLoans([]))
			.finally(() => setLoadingLoans(false));
	}, [selectedBook]);

	// Check if user already has a copy of this book checked out (not returned)
	const userHasActiveLoanForBook = !!selectedBook && userLoans.some(
		loan => {
			const copy = copies.find((c: Copy) => c.id === loan.copyId);
			return copy && copy.bookId === selectedBook.id && loan.returnedAt == null;
		}
	);

	const isAvailable = copies.some(copy => copy.conditionStatus === "AVAILABLE");

	const handleModalClose = () => {
		setActiveTab(ActiveTabEnum.details);
		onModalClose();
	};

	return (
		<Dialog
			open={modalOpen}
			onClose={handleModalClose}
			maxWidth="md"
			fullWidth
			slotProps={{
				paper: {
					sx: {
						boxShadow: "none",
						backgroundImage: "none",
						display: "flex",
						flexDirection: "row",
						height: "95vh",
						overflow: "visible"
					}
				}
			}}
		>
			{selectedBook && (
				<>
					<Box
						sx={{
							width: 160,
							borderRight: "1px solid #ddd",
							p: 2,
							display: "flex",
							flexDirection: "column",
							gap: 2
						}}
					>
						{/* Book Cover */}
						<BookCover isbn={String(selectedBook.isbn)} alt={selectedBook.title + " Book Cover"} />
						{/* Rating */}
						<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
							<Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, textAlign: "center", mb: 0 }}>
								Average Rating
							</Typography>
							<Rating value={selectedBook.averageRating} precision={0.1} readOnly />
						</Box>
						{/* Navigation */}
						<Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", alignSelf: "flex-start", mt: 3 }}>
							{Object.values(ActiveTabEnum).map((tab) => (
								<Button
									key={tab}
									variant={activeTab === tab ? "contained" : "text"}
									onClick={() => setActiveTab(tab as ActiveTabEnum)}
								>
									{tab}
								</Button>
							))}
						</Box>
					</Box>
					{/* Content */}
					  <Box sx={{ flex: 1, p: 3, position: "relative", height: "100%", minWidth: 0, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
						{/* Close button */}
						<IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={handleModalClose}>
							<CloseIcon />
						</IconButton>
						{/* Title & Author */}
						<Box>
							<Typography variant="h4">{selectedBook.title}</Typography>
							<Typography variant="h6" color="text.secondary">
								{selectedBook.author}
							</Typography>
							{/* Checkout or Hold button based on availability */}
							{loadingCopies || loadingLoans ? (
								<Button variant="contained" color="primary" sx={{ mt: 2 }} disabled>
									Loading...
								</Button>
							) : userHasActiveLoanForBook ? (
								<Tooltip title="You already have a copy of this book checked out." arrow>
									<span>
										<Button variant="contained" color="primary" sx={{ mt: 2 }} disabled>
											{isAvailable ? "Check Out" : "Place Hold"}
										</Button>
									</span>
								</Tooltip>
							) : isAvailable ? (
								<>
									<Checkout
										copies={copies}
										onSuccess={() => {
											// Refresh available copies after successful checkout
											if (selectedBook) {
												setLoadingCopies(true);
												axios.get(`copies/book/${selectedBook.id}`)
													.then(res => setCopies(res.data))
													.catch(() => setCopies([]))
													.finally(() => setLoadingCopies(false));
											}
										}}
										setSuccess={setCheckoutSuccess}
									/>
									{checkoutSuccess && (
										<Typography color="success.main" sx={{ whiteSpace: 'pre-line', mt: 2 }}>{checkoutSuccess}</Typography>
									)}
								</>
							) : (
								<Button variant="contained" color="primary" sx={{ mt: 2 }}>
									Place Hold
								</Button>
							)}
						</Box>
						<Divider sx={{ my: 2 }} />
						{/* Details */}
						{activeTab === ActiveTabEnum.details && (
							<Box sx={{ overflowY: 'auto', maxHeight: '50vh', pr: 1 }}>
								<Typography variant="body1" sx={{ mb: 2 }}>
									Summary
								</Typography>
								<Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
									{selectedBook.description}
								</Typography>
								<Typography variant="body2">Genre: {selectedBook.genre}</Typography>
								<Typography variant="body2">Published: {selectedBook.publicationYear}</Typography>
							</Box>
						)}
						{/* Copies */}
						{activeTab === ActiveTabEnum.copiesAvailable && (
							<Box>
								<Typography variant="body1" sx={{ mb: 2 }}>
									Copies Available
								</Typography>
								{branchesLoading ? (
									<Typography variant="body2">
										Loading branches...
									</Typography>
								) : branches.length === 0 ? (
									<Typography variant="body2">
										No branch data available.
									</Typography>
								) : (
									branches.map(branch => {
										const availableCount = copies.filter(copy => copy.branchId === branch.id && copy.conditionStatus === "AVAILABLE").length;
										return (
											<Typography key={branch.id} variant="body2">
												{branch.name} — {availableCount > 0 ? `${availableCount} available` : "No copies available"}
											</Typography>
										);
									})
								)}
							</Box>
						)}
						{/* Reviews */}
						{activeTab === ActiveTabEnum.reviews && (
							<Box>
								<Typography variant="body1" sx={{ mb: 2 }}>
									Reviews
								</Typography>
								<ReviewList reviews={reviews} />
							</Box>
						)}
						{/* WRITE REVIEW TAB */}
						{activeTab === ActiveTabEnum.writeAReview && selectedBook && (
							<WriteReview bookId={selectedBook.id} onReviewAdded={refreshReviews} />
						)}
					</Box>
				</>
			)}
		</Dialog>
	)
}

export default BookDetails;
