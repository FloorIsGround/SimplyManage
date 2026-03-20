-- Events table
CREATE TABLE IF NOT EXISTS public.events (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    date date NOT NULL,
    location text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL
);

-- Seed data for events
INSERT INTO public.events (title, description, date, location, start_time, end_time) VALUES
    ('Book Club: Mystery Night', 'Join us for a discussion of classic mystery novels.', '2026-03-15', 'Central Library', '18:00', '20:00'),
    ('Children''s Story Hour', 'Stories and crafts for ages 3-7.', '2026-03-10', 'West Branch', '10:00', '11:00'),
    ('Tech Workshop: Intro to Python', 'Beginner-friendly coding workshop.', '2026-03-20', 'East Branch', '14:00', '16:00'),
    ('Local Author Reading', 'Meet local authors and hear their latest works.', '2026-03-25', 'South Branch', '17:00', '19:00'),
    ('Spring Gardening Seminar', 'Tips and tricks for your spring garden.', '2026-03-12', 'Central Library', '15:00', '17:00');
-- Library table
CREATE TABLE IF NOT EXISTS public.library (
    id serial PRIMARY KEY,
    name text NOT NULL,
    address text NOT NULL,
    phone_number text NOT NULL
);

-- Library hours table
CREATE TABLE IF NOT EXISTS public.library_hours (
    id serial PRIMARY KEY,
    library_id integer NOT NULL REFERENCES public.library(id) ON DELETE CASCADE,
    day text NOT NULL,
    open text NOT NULL,
    close text NOT NULL
);

-- Seed data for libraries
INSERT INTO public.library (name, address, phone_number) VALUES
    ('Central Library', '100 Main St', '555-1000'),
    ('West Branch', '200 West St', '555-2000'),
    ('East Branch', '300 East St', '555-3000'),
    ('South Branch', '400 South St', '555-4000');

-- Seed data for library_hours
INSERT INTO public.library_hours (library_id, day, open, close) VALUES
    -- Central Library
    (1, 'Sunday', '08:00', '16:00'),
    (1, 'Monday', '08:00', '18:00'),
    (1, 'Tuesday', '08:00', '18:00'),
    (1, 'Wednesday', '08:00', '18:00'),
    (1, 'Thursday', '08:00', '18:00'),
    (1, 'Friday', '08:00', '19:00'),
    (1, 'Saturday', '08:00', '19:00'),
    -- West Branch
    (2, 'Sunday', '08:00', '16:00'),
    (2, 'Monday', '08:00', '18:00'),
    (2, 'Tuesday', '08:00', '18:00'),
    (2, 'Wednesday', '08:00', '18:00'),
    (2, 'Thursday', '08:00', '18:00'),
    (2, 'Friday', '08:00', '19:00'),
    (2, 'Saturday', '08:00', '19:00'),
    -- East Branch
    (3, 'Sunday', '08:00', '16:00'),
    (3, 'Monday', '08:00', '18:00'),
    (3, 'Tuesday', '08:00', '18:00'),
    (3, 'Wednesday', '08:00', '18:00'),
    (3, 'Thursday', '08:00', '18:00'),
    (3, 'Friday', '08:00', '19:00'),
    (3, 'Saturday', '08:00', '19:00'),
    -- South Branch
    (4, 'Sunday', '08:00', '16:00'),
    (4, 'Monday', '08:00', '18:00'),
    (4, 'Tuesday', '08:00', '18:00'),
    (4, 'Wednesday', '08:00', '18:00'),
    (4, 'Thursday', '08:00', '18:00'),
    (4, 'Friday', '08:00', '19:00'),
    (4, 'Saturday', '08:00', '19:00');

-- Ensure average_rating column exists on books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS average_rating numeric;
--
-- PostgreSQL database dump
--

\restrict lvvdpEvjmZIZBOCWOwI37pKsxMal3EIkUXGvFfQZ6NlTGTaVZgHpm5T0YNr31e9

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.books (
    book_id uuid DEFAULT gen_random_uuid() NOT NULL,
    isbn text,
    title text NOT NULL,
    author text NOT NULL,
    genre text,
    audience text,
    description text,
    publication_year integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    average_rating numeric
);
--
-- Reviews table for book reviews
--
CREATE TABLE IF NOT EXISTS public.reviews (
    id serial PRIMARY KEY,
    user_id uuid NOT NULL,
    book_id uuid NOT NULL REFERENCES public.books(book_id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: copies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.copies (
    copy_id uuid DEFAULT gen_random_uuid() NOT NULL,
    book_id uuid NOT NULL,
    barcode text,
    condition_status text NOT NULL,
    location text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT copies_condition_status_check CHECK ((condition_status = ANY (ARRAY['AVAILABLE'::text, 'LOST'::text, 'DAMAGED'::text, 'MAINTENANCE'::text])))
);

-- Currently in the database already:
-- CREATE SEQUENCE copy_barcode_seq;
-- ALTER TABLE copies ALTER COLUMN barcode SET DEFAULT 'BC' || LPAD(nextval('copy_barcode_seq')::text, 8, '0');



--
-- Name: fees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.fees (
    fee_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    loan_id uuid,
    amount_cents integer NOT NULL,
    reason text NOT NULL,
    status text NOT NULL,
    assessed_at timestamp with time zone NOT NULL,
    CONSTRAINT fees_amount_cents_check CHECK ((amount_cents >= 0)),
    CONSTRAINT fees_reason_check CHECK ((reason = ANY (ARRAY['OVERDUE'::text, 'LOST'::text, 'DAMAGED'::text, 'MANUAL'::text]))),
    CONSTRAINT fees_status_check CHECK ((status = ANY (ARRAY['ASSESSED'::text, 'WAIVED'::text, 'PAID'::text])))
);


--
-- Name: holds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.holds (
    hold_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    book_id uuid NOT NULL,
    placed_at timestamp with time zone NOT NULL,
    status text NOT NULL,
    ready_expires_at timestamp with time zone,
    CONSTRAINT holds_status_check CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'READY'::text, 'FULFILLED'::text, 'CANCELLED'::text])))
);


--
-- Name: loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.loans (
    loan_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    copy_id uuid NOT NULL,
    checkout_at timestamp with time zone NOT NULL,
    due_at timestamp with time zone NOT NULL,
    returned_at timestamp with time zone,
    renewal_count integer DEFAULT 0 NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['PATRON'::text, 'LIBRARIAN'::text, 'ADMIN'::text]))),
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'SUSPENDED'::text])))
);

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.faqs (
    faq_id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT faqs_pkey PRIMARY KEY (faq_id)
);

--
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.books
--     ADD CONSTRAINT books_isbn_key UNIQUE (isbn);



-- ALTER TABLE ONLY public.books
--     ADD CONSTRAINT books_pkey PRIMARY KEY (book_id);


--
-- Seed data for books
-- Clear books and users tables before seeding to avoid unique constraint errors
DELETE FROM public.reviews;
DELETE FROM public.books;
DELETE FROM public.users;
--
INSERT INTO public.books (isbn, title, author, genre, audience, description, publication_year)
VALUES
    ('9780143127741', 'The Martian', 'Andy Weir', 'Science Fiction', 'Adult', 'A stranded astronaut must survive on Mars.', 2014),
    ('9780062316097', 'The Alchemist', 'Paulo Coelho', 'Adventure', 'Young Adult', 'A shepherd boy pursues his dreams across the desert.', 1988),
    ('9780439139601', 'Harry Potter and the Goblet of Fire', 'J.K. Rowling', 'Fantasy', 'Juvenile', 'The fourth year at Hogwarts brings new challenges.', 2000),
    ('9780553386790', 'A Game of Thrones', 'George R.R. Martin', 'Fantasy', 'Young Adult', 'Noble families vie for control of the Iron Throne.', 1996),
    ('9780385472579', 'Zen and the Art of Motorcycle Maintenance', 'Robert M. Pirsig', 'Philosophy', 'Adult', 'A philosophical journey across America.', 1974);


-- Seed data for users
INSERT INTO public.users (user_id, email, password_hash, first_name, last_name, role, status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '$2b$10$adminhash', 'Alice', 'Admin', 'ADMIN', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222222', 'librarian@example.com', '$2b$10$librarianhash', 'Bob', 'Librarian', 'LIBRARIAN', 'ACTIVE'),
    ('33333333-3333-3333-3333-333333333333', 'patron@example.com', '$2b$10$patronhash', 'Carol', 'Patron', 'PATRON', 'ACTIVE');

-- Seed data for reviews
-- (Assumes book_ids exist from books table; replace with actual UUIDs if needed)
INSERT INTO public.reviews (user_id, book_id, rating, comment)
VALUES
    ('33333333-3333-3333-3333-333333333333', (SELECT book_id FROM public.books WHERE title = 'The Martian' LIMIT 1), 5, 'Amazing and realistic science!'),
    ('22222222-2222-2222-2222-222222222222', (SELECT book_id FROM public.books WHERE title = 'The Alchemist' LIMIT 1), 4, 'Inspirational journey.'),
    ('11111111-1111-1111-1111-111111111111', (SELECT book_id FROM public.books WHERE title = 'A Game of Thrones' LIMIT 1), 5, 'Epic fantasy and intrigue.');


--
-- Name: copies copies_barcode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.copies
--     ADD CONSTRAINT copies_barcode_key UNIQUE (barcode);


--
-- Name: copies copies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.copies
--     ADD CONSTRAINT copies_pkey PRIMARY KEY (copy_id);


--
-- Name: fees fees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.fees
--     ADD CONSTRAINT fees_pkey PRIMARY KEY (fee_id);


--
-- Name: holds holds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.holds
--     ADD CONSTRAINT holds_pkey PRIMARY KEY (hold_id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.loans
--     ADD CONSTRAINT loans_pkey PRIMARY KEY (loan_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.users
--     ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.users
--     ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: copies_book_id_idx; Type: INDEX; Schema: public; Owner: -
--

-- CREATE INDEX copies_book_id_idx ON public.copies USING btree (book_id);


--
-- Name: fees_loan_id_idx; Type: INDEX; Schema: public; Owner: -
--

-- CREATE INDEX fees_loan_id_idx ON public.fees USING btree (loan_id);


--
-- Name: fees_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

-- CREATE INDEX fees_user_id_idx ON public.fees USING btree (user_id);


--
-- Name: holds_book_id_idx; Type: INDEX; Schema: public; Owner: -
--

-- CREATE INDEX holds_book_id_idx ON public.holds USING btree (book_id);


--
-- Name: holds_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

-- CREATE INDEX holds_user_id_idx ON public.holds USING btree (user_id);


--
-- Name: loans_copy_id_idx; Type: INDEX; Schema: public; Owner: -
--

-- CREATE INDEX loans_copy_id_idx ON public.loans USING btree (copy_id);


--
-- Name: loans_one_active_per_copy; Type: INDEX; Schema: public; Owner: -
--

-- CREATE UNIQUE INDEX loans_one_active_per_copy ON public.loans USING btree (copy_id) WHERE (returned_at IS NULL);


--
-- Name: loans_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

-- CREATE INDEX loans_user_id_idx ON public.loans USING btree (user_id);


--
-- Name: copies copies_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.copies
--     ADD CONSTRAINT copies_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE RESTRICT;


--
-- Name: fees fees_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.fees
--     ADD CONSTRAINT fees_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(loan_id) ON DELETE SET NULL;


--
-- Name: fees fees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.fees
--     ADD CONSTRAINT fees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: holds holds_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.holds
--     ADD CONSTRAINT holds_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE RESTRICT;


--
-- Name: holds holds_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.holds
--     ADD CONSTRAINT holds_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: loans loans_copy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.loans
--     ADD CONSTRAINT loans_copy_id_fkey FOREIGN KEY (copy_id) REFERENCES public.copies(copy_id) ON DELETE RESTRICT;


--
-- Name: loans loans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- ALTER TABLE ONLY public.loans
--     ADD CONSTRAINT loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict lvvdpEvjmZIZBOCWOwI37pKsxMal3EIkUXGvFfQZ6NlTGTaVZgHpm5T0YNr31e9

