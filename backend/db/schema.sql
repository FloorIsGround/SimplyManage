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

CREATE TABLE public.books (
    book_id uuid DEFAULT gen_random_uuid() NOT NULL,
    isbn text,
    title text NOT NULL,
    author text NOT NULL,
    genre text,
    description text,
    publication_year integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: copies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copies (
    copy_id uuid DEFAULT gen_random_uuid() NOT NULL,
    book_id uuid NOT NULL,
    barcode text,
    condition_status text NOT NULL,
    location text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT copies_condition_status_check CHECK ((condition_status = ANY (ARRAY['AVAILABLE'::text, 'LOST'::text, 'DAMAGED'::text, 'MAINTENANCE'::text])))
);


--
-- Name: fees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fees (
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

CREATE TABLE public.holds (
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

CREATE TABLE public.loans (
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

CREATE TABLE public.users (
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

CREATE TABLE public.faqs (
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

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (book_id);


--
-- Name: copies copies_barcode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_barcode_key UNIQUE (barcode);


--
-- Name: copies copies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_pkey PRIMARY KEY (copy_id);


--
-- Name: fees fees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_pkey PRIMARY KEY (fee_id);


--
-- Name: holds holds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holds
    ADD CONSTRAINT holds_pkey PRIMARY KEY (hold_id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (loan_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: copies_book_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX copies_book_id_idx ON public.copies USING btree (book_id);


--
-- Name: fees_loan_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fees_loan_id_idx ON public.fees USING btree (loan_id);


--
-- Name: fees_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fees_user_id_idx ON public.fees USING btree (user_id);


--
-- Name: holds_book_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX holds_book_id_idx ON public.holds USING btree (book_id);


--
-- Name: holds_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX holds_user_id_idx ON public.holds USING btree (user_id);


--
-- Name: loans_copy_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loans_copy_id_idx ON public.loans USING btree (copy_id);


--
-- Name: loans_one_active_per_copy; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX loans_one_active_per_copy ON public.loans USING btree (copy_id) WHERE (returned_at IS NULL);


--
-- Name: loans_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loans_user_id_idx ON public.loans USING btree (user_id);


--
-- Name: copies copies_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE RESTRICT;


--
-- Name: fees fees_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(loan_id) ON DELETE SET NULL;


--
-- Name: fees fees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: holds holds_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holds
    ADD CONSTRAINT holds_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE RESTRICT;


--
-- Name: holds holds_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holds
    ADD CONSTRAINT holds_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: loans loans_copy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_copy_id_fkey FOREIGN KEY (copy_id) REFERENCES public.copies(copy_id) ON DELETE RESTRICT;


--
-- Name: loans loans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict lvvdpEvjmZIZBOCWOwI37pKsxMal3EIkUXGvFfQZ6NlTGTaVZgHpm5T0YNr31e9

